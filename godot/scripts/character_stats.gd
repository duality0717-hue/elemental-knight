class_name CharacterStats
extends Resource

@export_range(1, 100) var strength: int = 1
@export_range(1, 100) var energy: int = 1
@export_range(1, 100) var vitality: int = 1
@export_range(1, 100) var agility: int = 1
@export var kills: int = 0
@export var equipment: Array[ItemData] = []

const QUALITY_POWER := {"bronze": 1.0, "silver": 2.0, "gold": 3.0}
const ARMOR_SLOTS := [0, 2, 3, 1, 9]
const DASH_COST := 20.0
const DASH_SPEED := 270.0
const DASH_DURATION := 0.17
const DASH_COOLDOWN := 0.7
const DASH_INVULNERABILITY := 0.35
const ENERGY_REGEN := 15.0
const HIT_INVULNERABILITY := 1.1
const ATTACK_DURATION := 0.18

func _init() -> void:
	equipment.resize(10)

func rank(slot: int) -> float:
	var item: ItemData = equipment[slot]
	return 0.0 if item == null else float(QUALITY_POWER.get(item.quality, 1.0)) * (1.0 + item.level * 0.04)

func armor_set() -> bool:
	var first: ItemData = equipment[0]
	if first == null:
		return false
	for slot in ARMOR_SLOTS:
		if equipment[slot] == null or equipment[slot].element != first.element:
			return false
	return true

func weapon_type() -> String:
	if equipment[4] != null and equipment[4].weapon != "":
		return equipment[4].weapon
	if equipment[8] != null and equipment[8].weapon != "shield":
		return equipment[8].weapon
	return ""

func calculate() -> Dictionary:
	var level := 1 + floori(kills / 5.0)
	var secondary: ItemData = equipment[8]
	return {
		"level": level,
		"damage": (24.0 + 6.0 * (rank(4) - 1.0) if rank(4) > 0 else 12.0) + (strength - 1) * 1.5 + rank(3) * 4 + rank(5) * 6 + (rank(8) * 5 if secondary != null and secondary.weapon != "shield" else 0.0),
		"maxHp": 100.0 + (vitality - 1) * 8,
		"maxEnergy": 50.0 + energy * 2,
		"armor": rank(0) * 3 + rank(2) * 2 + rank(9) * 2 + (rank(8) * 4 if secondary != null and secondary.weapon == "shield" else 0.0) + (4.0 if armor_set() else 0.0),
		"speed": 88.0 + (agility - 1) * 0.5 + rank(1) * 10,
		"delay": maxf(0.18, 0.48 / (1.0 + (agility - 1) * 0.01) * pow(0.88, rank(6))),
		"range": 65.0 if weapon_type() == "greatsword" else (47.0 if rank(4) > 0 else 33.0),
		"frost": false,
		"lifeOnHit": 0.6 + 0.03 * (vitality - 1) + 0.015 * (strength - 1) + 0.01 * (agility - 1) + 0.1 * (level - 1)
	}

func incoming_damage(amount: float) -> float:
	return maxf(2.0, amount - float(calculate().armor))
