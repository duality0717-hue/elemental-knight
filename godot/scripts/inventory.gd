class_name KnightInventory
extends Node

signal changed
var items: Array[ItemData] = []
var gold: int = 0
var collected_ids: Dictionary = {}

func collect(item: ItemData) -> bool:
	if item == null or collected_ids.has(item.id):
		return false
	collected_ids[item.id] = true
	if item.kind == "gold":
		gold += item.amount
	else:
		items.append(item)
	changed.emit()
	return true

func owned_slots() -> Array:
	var slots: Array = []
	for item in items:
		if item.kind == "gear":
			slots.append(item.slot)
	return slots
