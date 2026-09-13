extends SceneTree
func _initialize() -> void:
	_run.call_deferred()
func _run() -> void:
	var room := load("res://scenes/Room.tscn").instantiate() as Node2D
	root.add_child(room)
	await create_timer(0.3).timeout
	await RenderingServer.frame_post_draw
	var destination := OS.get_environment("EK_PREVIEW_PATH")
	if destination.is_empty(): destination = "user://godot-core.png"
	var error := root.get_texture().get_image().save_png(destination)
	print("Native scene preview: ", destination, " error=", error)
	quit(0 if error == OK else 1)
