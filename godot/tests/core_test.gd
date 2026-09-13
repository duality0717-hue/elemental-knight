extends SceneTree
var failures: Array[String] = []
var checks := 0
func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures.append(label)
		push_error(label)
func near(a: float, b: float, label: String) -> void:
	check(absf(a-b)<0.00001, label + " (%s vs %s)" % [a,b])
func _initialize() -> void:
	_run.call_deferred()
func _run() -> void:
	var reference: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/reference.json"))
	for fixture in reference.cases:
		var stats := CharacterStats.new()
		for key in fixture.attributes:
			stats.set(key, int(fixture.attributes[key]))
		stats.kills = int(fixture.kills)
		for slot in range(10):
			if fixture.equipment[slot] != null:
				stats.equipment[slot] = ItemData.from_dictionary(fixture.equipment[slot])
		var actual := stats.calculate()
		for key in fixture.expected:
			if key == "frost":
				check(actual[key] == fixture.expected[key], "frost parity")
			else:
				near(actual[key], fixture.expected[key], "stats %s: %s" % [fixture.kills,key])
		near(stats.incoming_damage(35),fixture.damage35,"armor mitigation")
	var table := LootTable.new()
	var counts := {"gear":0,"potion":0,"gold":0}
	for i in range(10000):
		counts[LootTable.category(i/10000.0)] += 1
	check(counts == {"gear":500,"potion":1000,"gold":8500}, "exact 5/10/85 intervals")
	for boundary in reference.boundaries:
		var item := table.item_for_roll(boundary.roll)
		check(item.kind == boundary.kind,"JS loot boundary %s" % boundary.roll)
		if item.kind == "gold": near(item.amount,boundary.amount,"gold amount")
		if item.kind == "gear": check(item.level == 0 and item.slot < 9,"normal gear level/eligible slots")
	near(CharacterStats.DASH_COST,reference.dash.cost,"dash cost")
	near(CharacterStats.DASH_DURATION,reference.dash.duration,"dash duration")
	near(CharacterStats.DASH_COOLDOWN,reference.dash.cooldown,"dash cooldown")
	near(CharacterStats.DASH_INVULNERABILITY,reference.dash.invulnerability,"dash invulnerability")
	var room := load("res://scenes/Room.tscn").instantiate() as Node2D
	root.add_child(room)
	var player := room.get_node("Player") as KnightPlayer
	var enemy := room.get_node("Enemy") as KnightEnemy
	enemy.set_physics_process(false)
	near(enemy.health.maximum,reference.enemy.hp,"enemy starting HP")
	await physics_frame
	await physics_frame
	# Actual native input and CharacterBody collision, including dash into a wall.
	player.position = Vector2(40,100)
	Input.action_press("move_left")
	await create_timer(0.5).timeout
	Input.action_release("move_left")
	check(player.position.x >= 23.9 and player.position.x < 25,"movement stops at wall")
	player.facing = Vector2.LEFT
	var stamina_before := player.stamina
	check(player.dash(),"dash starts")
	near(player.stamina,stamina_before-20,"dash consumes energy")
	check(not player.dash(),"dash cooldown enforced")
	await create_timer(0.25).timeout
	check(player.position.x >= 23.9,"dash cannot tunnel through wall")
	player.position = Vector2(100,100)
	Input.action_press("move_right")
	Input.action_press("move_down")
	await physics_frame
	await physics_frame
	near(player.velocity.length(),88,"diagonal normalized speed")
	Input.action_release("move_right")
	Input.action_release("move_down")
	player.position = Vector2(100,160)
	player.facing = Vector2.RIGHT
	enemy.position = Vector2(125,160)
	player.health.invulnerability.stop()
	player.health.current = 50
	await physics_frame
	await physics_frame
	near(player.attack(),12,"basic attack actual damage")
	near(enemy.health.current,42,"enemy loses HP")
	near(player.health.current,50.6,"life on hit")
	near(player.attack(),0,"attack cooldown prevents duplicate hit")
	near(player.take_damage(11),11,"enemy damage")
	near(player.take_damage(11),0,"hit invulnerability")
	# Enemy attacks after windup, never on entering its radius.
	player.health.invulnerability.stop()
	enemy.state = KnightEnemy.State.CHASE
	enemy.set_physics_process(true)
	var hp := player.health.current
	await create_timer(0.3).timeout
	near(player.health.current,hp,"enemy windup")
	await create_timer(0.6).timeout
	near(player.health.current,hp-11,"enemy attack after windup")
	enemy.set_physics_process(false)
	enemy.state_timer.stop()
	# Real Area2D pickup for each category, once only.
	for roll in [0.01,0.1,0.8]:
		var pickup := load("res://scenes/LootPickup.tscn").instantiate() as LootPickup
		var item := table.item_for_roll(roll)
		pickup.item = item
		pickup.position = player.position
		room.add_child(pickup)
		await physics_frame
		await physics_frame
		await physics_frame
		check(player.inventory.collected_ids.has(item.id),"Area pickup " + item.kind)
		check(not player.inventory.collect(item),"duplicate pickup rejected")
	near(player.inventory.gold,16,"gold pickup stored")
	check(player.inventory.items.size()==2,"gear and potion stored")
	# Death spawns exactly one physical drop; dead player cannot act.
	room.loot_table.next_id = 100
	enemy.take_damage(999)
	await process_frame
	await physics_frame
	var drops := 0
	for child in room.get_children():
		if child is LootPickup: drops += 1
	check(drops==1,"one enemy death produces one pickup")
	player.health.invulnerability.stop()
	player.take_damage(9999)
	check(not player.dash() and player.attack()==0,"dead player cannot dash or attack")
	room.queue_free()
	await process_frame
	print("Godot core: %d checks, %d failures" % [checks,failures.size()])
	quit(0 if failures.is_empty() else 1)
