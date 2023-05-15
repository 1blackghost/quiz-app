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
    conn = sqlite3.connect('results.db')
    c = conn.cursor()

    print("[WARNING!] You need admin privilege to clear and reset the data! Are you sure? (y/n/yes/no)")
    a = input()
    c.execute("DROP TABLE IF EXISTS quizzes")
    if a in ("y", "yes"):
        c.execute('''CREATE TABLE IF NOT EXISTS quizzes
                    (uid INTEGER PRIMARY KEY AUTOINCREMENT,
                     name TEXT NOT NULL,
                     result TEXT NOT NULL
                     )''')

    conn.commit()
    c.close()
    conn.close()


def insert_quiz(uid, name="", result="") -> None:
    """
    Insert a new quiz into the database.

    Args:
        uid: Quiz ID.
        name: Name associated with the quiz.
        result: Result of the quiz.

    Returns:
        None
    """
    conn = sqlite3.connect('results.db')
    c = conn.cursor()

    c.execute("INSERT INTO quizzes (id, name, result) VALUES (?, ?, ?)",
              (uid, name, result))
    conn.commit()
    c.close()
    conn.close()


def read_quiz(uid=-1) -> list:
    """
    Read quiz details from the database.

    Args:
        uid: Quiz ID to retrieve. If -1, retrieve all quizzes.

    Returns:
        list: Quiz details as a list of tuples.
    """
    conn = sqlite3.connect('results.db')
    c = conn.cursor()

    if uid != -1:
        c.execute("SELECT * FROM quizzes WHERE id = ?", (uid,))
        result = c.fetchall()
    else:
        c.execute("SELECT * FROM quizzes")
        result = c.fetchall()

    c.close()
    conn.close()

    return result
