# coding: utf-8

import os
import time
import git


class RepoModifier(object):
    edit_command = """\
    cd "{path}"
    rm -rf "$(git rev-parse --git-dir)/refs/original/"

    git filter-branch --env-filter \\
    \"
        {commands}
    \" {rev}
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
            # print "Not a valid git repo:", repo_path
            raise

    @staticmethod
    def make_timestamp(time_str, dash=False):
        """\
        getTime('2016/01/27 23:12:18') -> 1453907538
        """
        if dash:
            time_array = time.strptime(time_str, "%Y-%m-%d %H:%M:%S")
        else:
            time_array = time.strptime(time_str, "%Y/%m/%d %H:%M:%S")
        timestamp = int(time.mktime(time_array))
        return timestamp

    @staticmethod
    def make_time_str(timestamp):
        """\
        getTime(1453907538) -> '2016/01/27 23:12:18'
        """
        time_array = time.localtime(timestamp)
        time_str = time.strftime("%Y/%m/%d %H:%M:%S", time_array)
        return time_str

    @classmethod
    def generate_command(cls, repo_path, rev, old_commits, new_commits):
        command_list = []
        for index, old_commit in enumerate(old_commits):
            params = {
                "commit_sha": old_commit["sha"]
            }

            new_commit = new_commits[index]

            old_commit["commit_time_str"] = " ".join([old_commit["date"], old_commit["time"]])
            new_commit["commit_time_str"] = " ".join([new_commit["date"], new_commit["time"]])
            old_commit["commit_time"] = cls.make_timestamp(old_commit["commit_time_str"],
                                                           dash=True)
            new_commit["commit_time"] = cls.make_timestamp(new_commit["commit_time_str"],
                                                           dash=True)

            commit_time = (old_commit["commit_time"] != new_commit["commit_time"])
            commit_name = (old_commit["author"] != new_commit["author"])
            commit_email = (old_commit["email"] != new_commit["email"])

            if commit_time or commit_name or commit_email:
                if commit_time:
                    params["commit_time"] = "'{}'".format(new_commit["commit_time"])
                else:
                    params["commit_time"] = "\"\\$GIT_COMMITTER_DATE\""

                if commit_name:
                    params["commit_name"] = "'{}'".format(new_commit["author"])
                else:
                    params["commit_name"] = "\"\\$GIT_AUTHOR_NAME\""

                if commit_email:
                    params["commit_email"] = "'{}'".format(new_commit["email"])
                else:
                    params["commit_email"] = "\"\\$GIT_AUTHOR_EMAIL\""

                command_list.append(cls.time_command.format(**params))

        command = cls.edit_command.format(
                path=repo_path.replace("\\", "\\\\"),
                commands="".join(command_list),
                rev=rev)

        return command

    def get_commits(self, rev=""):
        """\
        Getting all the commits behind the given commit
        """

        if not self.repo:
            raise git.InvalidGitRepositoryError

        yield from self.repo.iter_commits(rev)

    def console_modify(self):
        """\
        Modify all the commits in console
        """
        commits = self.get_commits()

        for commit in commits:
            params = {
                "commit_sha": commit.hexsha
            }

            print("\n", commit.hexsha[:6], commit.message.split("\n")[0])
            c = input("Modify it? (y/n): ")
            if c.lower() not in ("y", "yes"):
                continue

            print("Commit time(\"%s\"):" % self.make_time_str(commit.authored_date))
            commit_time = input()
            print("Commit author name (%s):" % commit.author.name)
            commit_name = input()
            print("Commit author email (%s):" % commit.author.email)
            commit_email = input()

            if commit_time or commit_name or commit_email:
                if commit_time:
                    params["commit_time"] = "'{}'".format(commit_time)
                else:
                    params["commit_time"] = "\"\\$GIT_COMMITTER_DATE\""

                if commit_name:
                    params["commit_name"] = "'{}'".format(commit_name)
                else:
                    params["commit_name"] = "\"\\$GIT_AUTHOR_NAME\""

                if commit_email:
                    params["commit_email"] = "'{}'".format(commit_email)
                else:
                    params["commit_email"] = "\"\\$GIT_AUTHOR_EMAIL\""

                self.command_list.append(self.time_command.format(**params))

        self.command = self.edit_command.format(
                path=self.repo_path.replace("\\", "\\\\"),
                commands="".join(self.command_list))

        return self.command

    def run(self):
        """\
        Run the shell script.
        """
        with open("./modify_time.sh", "w") as f:
            f.write(self.command)
        os.system("sh modify_time.sh")
        os.remove("./modify_time.sh")


if __name__ == '__main__':
    pass
