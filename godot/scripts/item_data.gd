class_name ItemData
extends Resource

@export var id: int = 0
@export_enum("gear", "potion", "gold") var kind: String = "gear"
@export var slot: int = 0
@export var element: String = "ice"
@export var quality: String = "bronze"
@export_range(0, 25) var level: int = 0
@export var weapon: String = ""
@export var attribute: String = ""
@export var power: int = 1
@export var amount: int = 0

const SLOT_NAMES := ["Pechera", "Botas", "Casco", "Guantes", "Arma", "Anillo", "Pulsera", "Collar", "Segunda mano", "Capa"]

static func from_dictionary(data: Dictionary) -> ItemData:
	var item := ItemData.new()
	for field in ["id", "kind", "slot", "element", "quality", "level", "weapon", "attribute", "power", "amount"]:
		if data.has(field) and data[field] != null:
			item.set(field, data[field])
	if data.get("quality") == null:
		item.quality = ""
	return item

const NAMES := {"ice":"Hielo", "electric":"Eléctrico", "magma":"Magma", "poison":"Veneno", "bronze":"Bronce", "silver":"Plata", "gold":"Oro", "strength":"fuerza", "energy":"energía", "vitality":"vitalidad", "agility":"agilidad", "sword":"Espada", "staff":"Báculo", "bow":"Arco", "greatsword":"Mandoble", "shield":"Escudo"}

func label() -> String:
	if kind == "gold":
		return "%d de oro" % amount
	if kind == "potion":
		return "Poción de %s · +%d" % [NAMES.get(attribute, attribute), power]
	return "%s · %s%s · Nv. %d" % [NAMES.get(weapon, weapon) if weapon != "" else SLOT_NAMES[slot], NAMES.get(element, element), " · " + str(NAMES.get(quality, quality)) if quality != "" else "", level]
