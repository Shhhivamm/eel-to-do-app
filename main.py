import eel
import json
import os

todo_count = 0

eel.init("web")

def read_data():
    with open("data.json", "r") as file:
        return json.load(file)

def write_data(content):
    with open("data.json", "w") as file:
        json.dump(content, file)
    return content

@eel.expose
def create_todo(title, timer=None):
    global todo_count
    new_todo = {
        "id": todo_count + 1,
        "title": title,
        "timer": timer
    }
    content = read_data()
    content["todos"].append(new_todo)
    write_data(content)
    todo_count += 1
    return new_todo

@eel.expose
def list_todo():
    return read_data()

@eel.expose
def delete_todo(id): 
    global todo_count
    content = read_data()
    content["todos"] = [todo for todo in content["todos"] if todo["id"] != id]
    write_data(content)
    todo_count -= 1

# Ensure data.json exists
if not os.path.exists("data.json"):
    with open("data.json", "w") as file:
        json.dump({"todos": []}, file)
else:
    content = read_data()
    todo_count = len(content["todos"])
eel.start("index.html", size=(800, 600))
