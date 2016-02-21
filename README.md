# git_modifier

Modify commit author and commit date information of a git repo using `GitPython`.

Requirements:

> GitPython==1.0.2



## 吐槽
修改repo的作者和时间信息​，真是个奇怪的需求:joy:​

具体细节：

1. 使用`GitPython`读取某分支的所有commit及其sha, commit时间，作者名字及邮箱
2. 将所有commit显示，由用户决定是否修改、修改哪一项
3. 将用户选择拼成一个shell脚本
4. 在本地执行脚本
