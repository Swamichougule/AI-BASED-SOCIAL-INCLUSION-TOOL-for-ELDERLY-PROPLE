from flask import Flask, render_template, request, jsonify
import json
import re

app = Flask(__name__)

# Load intents from intents.json file
with open("intents.json", "r") as file:
    intents = json.load(file)

# Function to find a response based on keywords
def get_rule_based_response(user_input):
    for intent in intents["intents"]:
        for pattern in intent["patterns"]:
            if pattern.lower() in user_input:
                return intent["responses"][0]  # Return the first response found
    return "I'm sorry, I didn't understand that."

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json["message"].lower()
    bot_reply = get_rule_based_response(user_message)
    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)
