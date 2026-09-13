class_name KnightPlayer
extends CharacterBody2D

signal changed
@export var base_stats: CharacterStats
var stats: CharacterStats
var stamina: float
var facing := Vector2.RIGHT
@onready var health: KnightHealth = $Health
@onready var inventory: KnightInventory = $Inventory
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var attack_area: Area2D = $AttackArea
@onready var attack_cooldown: Timer = $AttackCooldown
@onready var attack_visual: Timer = $AttackVisual
@onready var dash_duration: Timer = $DashDuration
@onready var dash_cooldown: Timer = $DashCooldown

func _ready() -> void:
	stats = base_stats.duplicate(true) as CharacterStats
	var values := stats.calculate()
	health.maximum = values.maxHp
	health.current = health.maximum
	stamina = values.maxEnergy
	health.invulnerability.start(1.5)
	health.changed.connect(func(_hp: float, _max: float): changed.emit())
	health.died.connect(func(): sprite.modulate = Color("6d6670"); changed.emit())
	inventory.changed.connect(func(): changed.emit())

func _physics_process(delta: float) -> void:
	if health.current <= 0:
		velocity = Vector2.ZERO
		sprite.stop()
		return
	var values := stats.calculate()
	stamina = minf(values.maxEnergy, stamina + CharacterStats.ENERGY_REGEN * delta)
	var direction := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if dash_duration.is_stopped() and direction != Vector2.ZERO:
		facing = direction.normalized()
	if Input.is_action_just_pressed("dash"):
		dash()
	if Input.is_action_pressed("attack"):
		attack()
	velocity = direction * float(values.speed) if dash_duration.is_stopped() else facing * CharacterStats.DASH_SPEED
	move_and_slide()
	sprite.flip_h = facing.x < 0
	sprite.play("walk" if velocity.length() > 0.1 else "idle")
	sprite.modulate = Color("a1eaf0") if not dash_duration.is_stopped() else Color.WHITE
	queue_redraw()
	changed.emit()

func dash() -> bool:
	if health.current <= 0 or not dash_cooldown.is_stopped() or stamina < CharacterStats.DASH_COST:
		return false
	stamina -= CharacterStats.DASH_COST
	dash_duration.start(CharacterStats.DASH_DURATION)
	dash_cooldown.start(CharacterStats.DASH_COOLDOWN)
	health.invulnerability.start(maxf(health.invulnerability.time_left, CharacterStats.DASH_INVULNERABILITY))
	return true

func attack() -> float:
	if health.current <= 0 or not attack_cooldown.is_stopped():
		return 0.0
	var values := stats.calculate()
	attack_cooldown.start(values.delay)
	attack_visual.start(CharacterStats.ATTACK_DURATION)
	var total := 0.0
	for body in attack_area.get_overlapping_bodies():
		if not body is KnightEnemy:
			continue
		var offset: Vector2 = body.global_position - global_position
		if offset.length() >= float(values.range) or (offset.length() >= 17.0 and offset.normalized().dot(facing) <= -0.15):
			continue
		var ray := PhysicsRayQueryParameters2D.create(global_position, body.global_position, 1)
		if not get_world_2d().direct_space_state.intersect_ray(ray).is_empty():
			continue
		total += body.take_damage(values.damage)
	if total > 0.0:
		health.heal(minf(values.lifeOnHit, total * 0.08))
	queue_redraw()
	return total

func take_damage(amount: float) -> float:
	return health.damage(stats.incoming_damage(amount), CharacterStats.HIT_INVULNERABILITY)

func _draw() -> void:
	if not is_node_ready():
		return
	draw_line(Vector2.ZERO, facing * 17.0, Color("c8ac73"), 1.0)
	if not attack_visual.is_stopped():
		draw_arc(Vector2.ZERO, stats.calculate().range, facing.angle() - 1.72, facing.angle() + 1.72, 20, Color("f3dfaa"), 2.0)
