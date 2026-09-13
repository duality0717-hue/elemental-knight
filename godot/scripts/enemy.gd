class_name KnightEnemy
extends CharacterBody2D

signal defeated(at: Vector2)
enum State { CHASE, WINDUP, RECOVER, DEAD }
var state: State = State.CHASE
var facing := Vector2.LEFT
@onready var health: KnightHealth = $Health
@onready var attack_area: Area2D = $AttackArea
@onready var state_timer: Timer = $StateTimer
@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D
var target: KnightPlayer

func _ready() -> void:
	target = get_tree().get_first_node_in_group("player") as KnightPlayer
	health.died.connect(_die)
	state_timer.timeout.connect(_finish_state)

func _physics_process(_delta: float) -> void:
	velocity = Vector2.ZERO
	if state == State.DEAD or target == null or target.health.current <= 0:
		return
	var offset := target.global_position - global_position
	if state == State.CHASE:
		facing = offset.normalized()
		if offset.length() > 30:
			velocity = facing * 44.0
		if offset.length() < 48:
			state = State.WINDUP
			state_timer.start(0.75)
	move_and_slide()
	sprite.flip_h = facing.x < 0
	sprite.play("walk" if velocity.length() > 0 else "idle")
	queue_redraw()

func _finish_state() -> void:
	if state == State.WINDUP:
		if target != null and target in attack_area.get_overlapping_bodies():
			var offset := target.global_position - global_position
			var ray := PhysicsRayQueryParameters2D.create(global_position, target.global_position, 1)
			if offset.length() < 48.0 and offset.normalized().dot(facing) > 0.2 and get_world_2d().direct_space_state.intersect_ray(ray).is_empty():
				target.take_damage(11.0)
		state = State.RECOVER
		state_timer.start(1.0)
	elif state == State.RECOVER:
		state = State.CHASE
	queue_redraw()

func take_damage(amount: float) -> float:
	return health.damage(amount)

func _die() -> void:
	state = State.DEAD
	state_timer.stop()
	defeated.emit(global_position)
	queue_free()

func _draw() -> void:
	if not is_node_ready():
		return
	draw_rect(Rect2(-12, -24, 24, 2), Color("38252d"))
	draw_rect(Rect2(-12, -24, 24 * health.current / health.maximum, 2), Color("d18878"))
	if state == State.WINDUP:
		draw_arc(Vector2.ZERO, 48.0, facing.angle() - 1.36, facing.angle() + 1.36, 20, Color("ed8c6e"), 1.0)
