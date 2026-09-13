class_name KnightHealth
extends Node

signal changed(current: float, maximum: float)
signal died
@export var maximum: float = 100.0
var current: float = 100.0
@onready var invulnerability: Timer = $Invulnerability

func _ready() -> void:
	current = maximum

func damage(amount: float, grace: float = 0.0) -> float:
	if current <= 0.0 or not invulnerability.is_stopped():
		return 0.0
	var dealt := minf(current, amount)
	current -= dealt
	if grace > 0.0:
		invulnerability.start(grace)
	changed.emit(current, maximum)
	if current <= 0.0:
		died.emit()
	return dealt

func heal(amount: float) -> void:
	if current <= 0.0:
		return
	current = minf(maximum, current + amount)
	changed.emit(current, maximum)
