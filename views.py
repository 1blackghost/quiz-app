"""
This module contains the views/routes of the website.
"""

from flask import jsonify, request, session
from main import app
from DBMS import question_db, results_db


@app.route("/quizzes/<id>", methods=["GET"])
def quiz_for_id(id: str) -> jsonify:
    """
    Retrieve quiz details for a given ID.

    Args:
        id (str): Quiz ID.

    Returns:
        jsonify: Quiz details.
    """
    data = question_db.read_quiz(id)
    quiz_details = {
        "uid": data[0],
        "question": data[1],
        "option1": data[2],
        "option2": data[3],
        "option3": data[4],
        "rightAnswer": data[5]
    }
    return jsonify(quiz_details)


@app.route("/quizzes/all", methods=["GET"])
def quiz_all() -> jsonify:
    """
    Retrieve all quizzes.

    Returns:
        jsonify: All quizzes.
    """
    data = question_db.read_quiz()
    return jsonify(data)


@app.route("/quizzes", methods=["POST", "GET"])
def quiz() -> jsonify:
    """
    Create a new quiz or retrieve quizzes.

    Returns:
        jsonify: Status and message.
    """
    quiz_data = request.get_json()
    question = quiz_data['question']
    option1 = quiz_data['options'][0]
    option2 = quiz_data['options'][1]
    option3 = quiz_data['options'][2]
    rightAnswer = quiz_data['rightAnswer']
    startDate = quiz_data['startDate']
    endDate = quiz_data['endDate']
    question_db.insert_quiz(question, option1, option2, option3, rightAnswer, startDate, endDate)

    return jsonify({"status": "ok", "message": ""})


@app.route("/getname", methods=["POST"])
def getname() -> jsonify:
    """
    Set the name in the session.

    Returns:
        jsonify: Status and message.
    """
    name = request.form.get("name")
    session["name"] = str(name)
    return jsonify({"status": "ok", "message": "Name received successfully"})


@app.route("/submitanswer/<id>", methods=["POST"])
def submitAnswer(id: str) -> dict:
    """
    Submit an answer for a quiz.

    Args:
        id (str): Quiz ID.

    Returns:
        dict: Status.
    """
    answer = request.form.get("answer")
    correct_answer = question_db.read_quiz(id)[5]
    if str(correct_answer) == str(answer):
        results_db.insert_quiz(id, session["name"], "Correct Answer")
    else:
        results_db.insert_quiz(id, session["name"], "Wrong Answer")

    return {"status": "ok"}


@app.route("/quizzes/result/<id>", methods=["GET"])
def getResult(id: str) -> jsonify:
    """
    Retrieve quiz results for a given ID.

    Args:
        id (str): Quiz ID.

    Returns:
        jsonify: Quiz results.
    """
    answers = results_db.read_quiz(id)
    array = []
    for i in answers:
        response = (i[2], i[3])
        array.append(response)
    return jsonify(array)
