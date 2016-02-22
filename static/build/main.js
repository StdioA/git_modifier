(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CommitForm = React.createClass({
	displayName: "CommitForm",

	getInitialState: function () {
		return {
			commits: this.props.commits,
			command: ""
		};
	},
	inputChange: function (event) {
		var commits = this.state.commits;

		var key_reg = /.*\$(\d+)\.\d+.(\d)\.0/;
		var ids = key_reg.exec(event.dispatchMarker),
		    commit_id = parseInt(ids[1]),
		    field_id = parseInt(ids[2]);

		if (field_id == 2) {
			commits[commit_id].author = event.target.value;
		} else if (field_id == 3) {
			commits[commit_id].email = event.target.value;
		} else if (field_id == 4) {
			commits[commit_id].date = event.target.value;
		} else if (field_id == 5) {
			commits[commit_id].time = event.target.value;
		}
		this.setState({ commits: commits });
	},
	doneClick: function (event) {
		if (event.target.id == "edit") {
			if (this.state.command == "") {
				var that = this;
				$.post("/get_command", { commits: JSON.stringify(this.state.commits) }, function (data, status) {
					that.setState({
						command: data.command
					});
				});
			}
		} else if (event.target.id == "run") {
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
		var command_input = null;
		if (this.state.command) {
			command_input = React.createElement(
				"div",
				{ className: "ten wide row" },
				React.createElement(
					"div",
					{ className: "ui form commands" },
					React.createElement(
						"div",
						{ className: "field" },
						React.createElement(
							"label",
							null,
							"Command"
						),
						React.createElement("textarea", { value: this.state.command, readOnly: true })
					)
				)
			);
		}
		return React.createElement(
			"div",
			{ className: "ui center aligned grid" },
			React.createElement(
				"div",
				{ className: "sixteen wide column" },
				React.createElement(
					"div",
					{ className: "ui form" },
					React.createElement(
						"div",
						{ className: "field" },
						React.createElement(
							"div",
							{ className: "three fields" },
							React.createElement(
								"div",
								{ className: "two wide disabled field" },
								React.createElement(
									"label",
									null,
									"SHA"
								)
							),
							React.createElement(
								"div",
								{ className: "four wide disabled field" },
								React.createElement(
									"label",
									null,
									"Message"
								)
							),
							React.createElement(
								"div",
								{ className: "two wide field" },
								React.createElement(
									"label",
									null,
									"Author"
								)
							),
							React.createElement(
								"div",
								{ className: "three wide field" },
								React.createElement(
									"label",
									null,
									"Email"
								)
							),
							React.createElement(
								"div",
								{ className: "three wide field" },
								React.createElement(
									"label",
									null,
									"Date"
								)
							),
							React.createElement(
								"div",
								{ className: "two wide field" },
								React.createElement(
									"label",
									null,
									"Time"
								)
							)
						)
					),
					this.state.commits.map(function (commit, index) {
						return React.createElement(
							"div",
							{ className: "sixteen wide column", key: index },
							React.createElement(
								"div",
								{ className: "field", key: index },
								React.createElement(
									"div",
									{ className: "three fields" },
									React.createElement(
										"div",
										{ className: "two wide disabled field" },
										React.createElement("input", { type: "text", placeholder: "SHA",
											value: commit.sha.slice(0, 6),
											onChange: this.inputChange })
									),
									React.createElement(
										"div",
										{ className: "four wide disabled field" },
										React.createElement("input", { type: "text", placeholder: "Message",
											value: commit.message,
											onChange: this.inputChange })
									),
									React.createElement(
										"div",
										{ className: "two wide field" },
										React.createElement("input", { type: "text", placeholder: "Author",
											value: commit.author,
											onChange: this.inputChange })
									),
									React.createElement(
										"div",
										{ className: "three wide field" },
										React.createElement("input", { type: "email", placeholder: "Email",
											value: commit.email,
											onChange: this.inputChange })
									),
									React.createElement(
										"div",
										{ className: "three wide field" },
										React.createElement("input", { type: "date", placeholder: "Date",
											value: commit.date,
											onChange: this.inputChange })
									),
									React.createElement(
										"div",
										{ className: "two wide field" },
										React.createElement("input", { type: "text", placeholder: "Time",
											value: commit.time,
											onChange: this.inputChange })
									)
								)
							)
						);
					}, this)
				)
			),
			command_input,
			React.createElement(
				"div",
				{ className: "ten wide row" },
				React.createElement(
					"button",
					{ className: "ui huge green button",
						onClick: this.doneClick,
						id: this.state.command == "" ? "edit" : "run" },
					this.state.command == "" ? "Done" : "Run"
				)
			)
		);
	}
});

$("#modify").on("click", function () {
	var addr = $("#addr").val();
	$.post("/get_commits", { address: addr }, function (data, status) {
		if (data.success) {
			ReactDOM.render(React.createElement(CommitForm, { commits: data.commits }), document.getElementById("commits"));
		}
	});
});

// ReactDOM.render(
// 	<CommitForm />,
// 	document.getElementById("commits")
// );

},{}]},{},[1]);