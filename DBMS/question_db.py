import sqlite3


def reset_back_to_start() -> None:
    """
    Reset the database to the initial state.

    This function drops the existing 'quizzes' table and recreates it.

    Note:
        This action requires admin privilege.

    Returns:
        None
    """
    conn = sqlite3.connect('question.db')
    c = conn.cursor()

    print("[WARNING!] You need admin privilege to clear and reset the data! Are you sure? (y/n/yes/no)")
    a = input()
    c.execute("DROP TABLE IF EXISTS quizzes")
    if a in ("y", "yes"):
        c.execute('''CREATE TABLE IF NOT EXISTS quizzes
                    (uid INTEGER PRIMARY KEY AUTOINCREMENT,
                     question TEXT NOT NULL,
                     option1 TEXT NOT NULL,
                     option2 TEXT NOT NULL,
                     option3 TEXT NOT NULL,
                     rightAnswer INTEGER NOT NULL,
                     startDate TEXT NOT NULL,
                     endDate TEXT NOT NULL
                     )''')

    conn.commit()
    c.close()
    conn.close()


def insert_quiz(question="", option1="", option2="", option3="", rightAnswer=0, startDate="", endDate="") -> int:
    """
    Insert a new quiz into the database.

    Args:
        question: Quiz question.
        option1: Option 1 of the quiz.
        option2: Option 2 of the quiz.
        option3: Option 3 of the quiz.
        rightAnswer: Index of the correct answer (1, 2, or 3).
        startDate: Start date of the quiz.
        endDate: End date of the quiz.

    Returns:
        int: ID of the inserted quiz.
    """
    conn = sqlite3.connect('question.db')
    c = conn.cursor()

    c.execute("INSERT INTO quizzes (question, option1, option2, option3, rightAnswer, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
              (question, option1, option2, option3, rightAnswer, startDate, endDate))
    uid = c.lastrowid
    conn.commit()
    c.close()
    conn.close()

    return uid


def read_quiz(uid=-1) -> list:
    """
    Read quiz details from the database.

    Args:
        uid: Quiz ID to retrieve. If -1, retrieve all quizzes.

    Returns:
        list: Quiz details as a list of tuples.
    """
    conn = sqlite3.connect('question.db')
    c = conn.cursor()

    if uid != -1:
        c.execute("SELECT * FROM quizzes WHERE uid = ?", (uid,))
        result = c.fetchone()
    else:
        c.execute("SELECT * FROM quizzes")
        result = c.fetchall()

    c.close()
    conn.close()

    return result
