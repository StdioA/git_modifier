var CommitForm = React.createClass({
	getInitialState: function () {
		return {
			commits: this.props.commits,
			command: "", 
		};
	},
	inputChange: function (event) {
		var commits = this.state.commits;

		var key_reg = /.*\$(\d+)\.\d+.(\d)\.0/;
		var time_reg = /^(\d|[0-1]\d|2[0-3]):(\d|[0-5]\d):(\d|[0-5]\d)$/;
		var ids = key_reg.exec(event.dispatchMarker),
			commit_id = parseInt(ids[1]),
			field_id = parseInt(ids[2]);

		if (field_id == 2) {
			commits[commit_id].author = event.target.value;
		}
		else if (field_id == 3) {
			commits[commit_id].email = event.target.value;
		}
		else if (field_id == 4) {
			commits[commit_id].date = event.target.value;
		}
		else if (field_id == 5) {
			commits[commit_id].time = event.target.value;
			if(time_reg.test(event.target.value)) {
				$(event.target).parent().removeClass("error");
			}
			else {
				$(event.target).parent().addClass("error");
			}
		}
		this.setState({commits: commits});

	},
	doneClick: function (event) {
		if (event.target.id == "edit") {
			if (this.state.command == "") {
				var that = this;
				$.post("/get_command",
					{commits: JSON.stringify(this.state.commits)},
					function (data, status) {
						that.setState({
							command: data.command
						});
					});		
			}
		}
		else if (event.target.id == "run") {
			var e = event.target;
			$(e).removeClass("green");
			$(e).addClass("loading");

			$.post("/run_command", {}, function () {
				$(e).removeClass("loading");
				$(e).addClass("green");
				$(e).text("Success!");
			});
		}
	},
	render: function () {
		// 若props改变，则刷新state数据(通过第一个commit的SHA来判断)
		if(this.state.commits[0].sha != this.props.commits[0].sha) {
			this.setState({
				commits: this.props.commits,
				commands: ""
			});
		}

		var command_input = null;
		if(this.state.command) {
			command_input = (
					<div className="ten wide column">
						<div className="ui form commands">
							<div className="field">
								<label>Command</label>
								<textarea value={this.state.command} readOnly={true}></textarea>
							</div>
						</div>
					</div>
				);
		}
		return (
			<div className="ui container">
			<div className="ui center aligned grid" >
				<div className="ui row">
					<div className="sixteen wide column">
						<div className="ui form">
							<div className="field">
								<div className="three fields">
									<div className="two wide disabled field">
										<label>SHA</label>
									</div>
									<div className="four wide disabled field">
										<label>Message</label>
									</div>
									<div className="two wide field">
										<label>Author</label>
									</div>
									<div className="three wide field">
										<label>Email</label>
									</div>
									<div className="three wide field">
										<label>Date</label>
									</div>
									<div className="two wide field">
										<label>Time</label>
									</div>
								</div>
							</div>
							{
								this.state.commits.map(function (commit, index) {
									return (
										<div className="field" key={index}>
											<div className="three fields">
												<div className="two wide disabled field">
													<input type="text" placeholder="SHA" 
															value={commit.sha.slice(0, 6)} 
															onChange={this.inputChange}/>
												</div>
												<div className="four wide disabled field">
													<input type="text" placeholder="Message" 
															value={commit.message} 
															onChange={this.inputChange}/>
												</div>
												<div className="two wide field">
													<input type="text" placeholder="Author"
															value={commit.author} 
															onChange={this.inputChange}/>
												</div>
												<div className="three wide field">
													<input type="email" placeholder="Email"
															value={commit.email} 
															onChange={this.inputChange}/>
												</div>
												<div className="three wide field">
													<input type="date" placeholder="Date" 
															value={commit.date} 
															onChange={this.inputChange}/>
												</div>
												<div className="two wide field">
													<input type="text" placeholder="Time"
															value={commit.time} 
															onChange={this.inputChange}/>
												</div>
											</div>
										</div>
									);
								}, this)
							}
						</div>
					</div>
				</div>
			</div>
			<div className="sixteen wide row">
				<div className="ui center aligned stackable grid">
					{command_input}
					<div className="three wide center aligned column">
						<button className="ui huge green button" 
								onClick={this.doneClick}
								id={this.state.command==""?"edit":"run"}>
							{this.state.command==""?"Done":"Run"}
						</button>
					</div>
				</div>
			</div>
			</div>
		);
	}
});

$("#modify").on("click", function () {
	var addr = $("#addr").val();
	$.post("/get_commits", 
		{address: addr},
		function (data, status) {
			if(data.success) {
				ReactDOM.render(
					<CommitForm commits={data.commits} />,
					document.getElementById("commits")
				);
			}
			else {
				ReactDOM.render(
					<div className="ui twelve wide column">
						<div className="ui red message">
							{data.error}
						</div>
					</div>,
					document.getElementById("commits")
				);
				$('.message .close').on('click', function() {
					$(this).closest('.message').transition('fade');
				});
			}
		});
	
})
