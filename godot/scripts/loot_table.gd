class_name LootTable
extends Resource

var rng := RandomNumberGenerator.new()
var next_id: int = 1
const ELEMENTS := ["ice", "electric", "magma", "poison"]
const QUALITIES := ["bronze", "silver", "gold"]
const ATTRIBUTES := ["strength", "energy", "vitality", "agility"]

func _init() -> void:
	rng.randomize()

static func category(roll: float) -> String:
	assert(roll >= 0.0 and roll < 1.0, "Loot roll must be in [0, 1)")
	if roll < 0.05:
		return "gear"
	if roll < 0.15:
		return "potion"
	return "gold"

func roll_loot(room: int = 1, owned_slots: Array = []) -> ItemData:
	# ONE category roll; later RNG calls only choose properties of the selected item.
	var roll := float(rng.randi()) / 4294967296.0
	return item_for_roll(roll, room, owned_slots)

func item_for_roll(roll: float, room: int = 1, owned_slots: Array = []) -> ItemData:
	var item := ItemData.new()
	item.id = next_id
	next_id += 1
	item.kind = category(roll)
	if item.kind == "gold":
		item.amount = 10 + room * 6
	elif item.kind == "potion":
		item.attribute = ATTRIBUTES[rng.randi_range(0, 3)]
		item.power = room
	else:
		var slots: Array = []
		for slot in range(9): # Cape remains unavailable before the second evolution.
			if not owned_slots.has(slot):
				slots.append(slot)
		if slots.is_empty():
			slots = range(9)
		item.slot = slots[rng.randi_range(0, slots.size() - 1)]
		item.element = ELEMENTS[rng.randi_range(0, 3)]
		item.quality = "" if item.slot in [5, 6, 7] else QUALITIES[rng.randi_range(0, 2)]
		item.level = 0
		if item.slot in [4, 8]:
			var weapons := ["sword", "staff", "shield"] if item.slot == 8 else ["sword", "staff", "bow", "greatsword"]
			item.weapon = weapons[rng.randi_range(0, weapons.size() - 1)]
	return item
