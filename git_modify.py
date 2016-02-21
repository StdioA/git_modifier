# coding: utf-8

import os
import time
import shutil
import git

class RepoModifier(object):
    edit_command = """\
cd {path}
rm -rf "$(git rev-parse --git-dir)/refs/original/"

git filter-branch --env-filter \\
\"
    {commands}
\"
"""

    time_command = """
if [ \\$GIT_COMMIT = \"{commit_sha}\" ]; then
     export GIT_AUTHOR_DATE={commit_time}
     export GIT_COMMITTER_DATE={commit_time}
     export GIT_AUTHOR_NAME={commit_name}
     export GIT_AUTHOR_EMAIL={commit_email}
     export GIT_COMMITTER_NAME=\\$GIT_AUTHOR_NAME
     export GIT_COMMITTER_EMAIL=\\$GIT_AUTHOR_EMAIL
fi
"""

    def __init__(self, repo_path):
        self.repo_path = repo_path
        self.command_list = []

        try:
            self.repo = git.Repo(repo_path)
        except git.InvalidGitRepositoryError:
            print "Not a valid git repo:", repo_path

    def make_time_stamp(cls, time_str):
        """\
        getTime('2016/01/27 23:12:18') -> 1453907538
        """
        time_array = time.strptime(time_str, "%Y/%m/%d %H:%M:%S")
        time_stamp = int(time.mktime(time_array))
        return time_stamp

    def make_time_str(cls, time_stamp):
        """\
        getTime(1453907538) -> '2016/01/27 23:12:18'
        """
        time_array = time.localtime(time_stamp)
        time_str = time.strftime("%Y/%m/%d %H:%M:%S", time_array)
        return time_str

    def get_commits(self, commit_name=""):
        """\
        Getting all the commits behind the given commit
        """

        if not self.repo:
            raise git.InvalidGitRepositoryError

        if not commit_name:
            commit = self.repo.commit("master")
        else:
            commit = self.repo.commit(commit_name)
        
        while True:
            yield commit
            if commit.parents:
                commit = commit.parents[0]
            else:
                break

    def console_modify(self):
        """\
        Modify all the commits in console
        """
        commits = self.get_commits()

        for commit in commits:
            params = {
                "commit_sha": commit.hexsha
            }

            print "\n", commit.hexsha[:6], commit.message.split("\n")[0]
            print "Modify it? (y/n)",
            c = raw_input()
            if c.lower() not in ("y", "yes"):
                continue

            print "Commit time(\"%s\"):" % self.make_time_str(commit.authored_date),
            commit_time = raw_input()
            print "Commit author name (%s):" % commit.author.name,
            commit_name = raw_input()
            print "Commit author email (%s):" % commit.author.email,
            commit_email = raw_input()

            if commit_time or commit_name or commit_email:
                if commit_time:
                    params["commit_time"] = "'%s'"%commit_time
                else:
                    params["commit_time"] = "\"\\$GIT_COMITTER_DATE\""

                if commit_name:
                    params["commit_name"] = "'%s'"%commit_name
                else:
                    params["commit_name"] = "\"\\$GIT_AUTHOR_NAME\""

                if commit_email:
                    params["commit_email"] = "'%s'"%commit_email
                else:
                    params["commit_email"] = "\"\\$GIT_AUTHOR_EMAIL\""

                self.command_list.append(self.time_command.format(**params))

        self.generate_command()
        return self.command

    def generate_command(self):
        """\
        Generate the edit shell script from the current commands list.
        """

        self.command = self.edit_command.format(
                path=self.repo_path.replace("\\", "\\\\"),
                commands="".join(self.command_list))

    def run(self):
        """\
        Run the shell script.
        """

        repo_path = self.repo_path
        with file("./modify_time.sh", "w") as f:
            f.write(self.command)
        os.system("sh modify_time.sh")
        os.remove("./modify_time.sh")


if __name__ == '__main__':
    repo_path = raw_input("Git path: ")
    repo = RepoModifier(repo_path)
    c = repo.console_modify()
    repo.run()
