class_name LootPickup
extends Area2D

signal picked(item: ItemData)
@export var item: ItemData
var collected := false

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	queue_redraw()

func _on_body_entered(body: Node2D) -> void:
	if collected or not body is KnightPlayer or body.health.current <= 0 or item == null:
		return
	if body.inventory.collect(item):
		collected = true
		picked.emit(item)
		queue_free()

func _draw() -> void:
	if item == null:
		return
	var color := Color("e5bb65") if item.kind == "gold" else (Color("a3d595") if item.kind == "potion" else Color("9ed5e7"))
	draw_circle(Vector2.ZERO, 10, Color(color, 0.12))
	if item.kind == "gear":
		draw_colored_polygon(PackedVector2Array([Vector2(0, -7), Vector2(6, 0), Vector2(0, 7), Vector2(-6, 0)]), color)
	elif item.kind == "potion":
		draw_rect(Rect2(-3, -7, 6, 4), color)
		draw_circle(Vector2(0, 2), 5, color)
	else:
		draw_circle(Vector2.ZERO, 5, color)
		draw_arc(Vector2.ZERO, 3, 0, TAU, 16, Color("72542e"), 1)
