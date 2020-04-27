# coding: utf-8

import os
import time
import json
from flask import Flask, render_template, jsonify, request, session
import git
from git_modify import RepoModifier

app = Flask(__name__)
app.config["SECRET_KEY"] = ";'AAN12#('S09KS[.:PQ9U0S'/2WEL"


def make_time_str(timestamp):
    time_array = time.localtime(timestamp)
    date_str = time.strftime("%Y-%m-%d", time_array)
    time_str = time.strftime("%H:%M:%S", time_array)
    return date_str, time_str


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/get_commits", methods=["POST"])
def get_commits():
    address, rev = request.form["address"], request.form["rev"]
    if not rev:
        rev = "master~20..master"

    session["address"] = address
    session["rev"] = rev
    try:
        repo = RepoModifier(address)
    except git.InvalidGitRepositoryError:
        data = {
            "success": False,
            "error": "Invalid git repository."
        }
    except git.NoSuchPathError:
        data = {
            "success": False,
            "error": "No such path."
        }
    else:
        data = {
            "success": True,
            "commits": []
        }
        for commit in repo.get_commits(rev):
            date, time = make_time_str(commit.authored_date)
            commit_data = {
                "sha": commit.hexsha,
                "message": commit.message.split("\n")[0],
                "author": commit.author.name,
                "email": commit.author.email,
                "date": date,
                "time": time,
            }
            data["commits"].append(commit_data)
        session["commits_old"] = data["commits"]
    finally:
        return jsonify(data)


@app.route("/get_command", methods=["POST"])
def get_command():
    address, rev = session["address"], session["rev"]
    old_commits = session["commits_old"]
    new_commits = json.loads(request.form["commits"])

    command = RepoModifier.generate_command(address, rev, old_commits, new_commits)
    session["command"] = command

    return jsonify({
        "command": command
    })


@app.route("/run_command", methods=["POST"])
def run_command():
    command = session["command"]

    with open("./modify_time.sh", "w") as f:
        f.write(command)
    os.system("sh modify_time.sh")
    os.remove("./modify_time.sh")

    return "success!"


if __name__ == "__main__":
    app.run(debug=True)
