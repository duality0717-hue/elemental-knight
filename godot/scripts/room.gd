extends Node2D

const PICKUP := preload("res://scenes/LootPickup.tscn")
var loot_table := LootTable.new()
var message := "Derrotá al guardián."
@onready var player: KnightPlayer = $Player

func _ready() -> void:
	$Enemy.defeated.connect(_enemy_defeated)
	player.changed.connect(_refresh)
	_refresh()

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("restart"):
		get_tree().reload_current_scene()

func _enemy_defeated(at: Vector2) -> void:
	player.stats.kills += 1
	var pickup := PICKUP.instantiate() as LootPickup
	pickup.item = loot_table.roll_loot(1, player.inventory.owned_slots())
	pickup.position = at
	pickup.picked.connect(func(_item: ItemData): message = "Botín recogido. R: reiniciar"; _refresh())
	# Death may occur during a physics callback: add the Area safely afterward.
	add_child.call_deferred(pickup)
	message = "Acercate al botín para recogerlo."
	_refresh()

func _refresh() -> void:
	$HUD/Status.text = "ELEMENTAL KNIGHT · GODOT 4.7.2\nVida %.0f / %.0f    Energía %.0f / %.0f" % [player.health.current, player.health.maximum, player.stamina, player.stats.calculate().maxEnergy]
	var entries := "INVENTARIO\nOro: %d\n" % player.inventory.gold
	for item in player.inventory.items:
		entries += "\n• " + item.label()
	entries += "\n\nWASD / flechas\nMover\n\nEspacio · atacar\nShift · dash\nR · reiniciar\n\n"
	entries += "Has caído. R: reintentar" if player.health.current <= 0 else message
	$HUD/Inventory.text = entries
