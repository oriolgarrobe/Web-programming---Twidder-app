//LGTM
displayView = function(){
	if (sessionStorage.getItem("token") == null) {
		document.getElementById('content').innerHTML = document.getElementById('welcomeview').innerHTML;
	}
	else {
		token = JSON.parse(sessionStorage.getItem("token"));
		document.getElementById('content').innerHTML = document.getElementById('logged_in').innerHTML;
		document.getElementById("tabs-1").style.display = 'block';
		get_user_data_by_token();
	}
};

//LGTM
window.onload = function() {
	displayView();
};

//LGTM
var validate_signup = function() {

	if (document.getElementById('signup_PSW').value != document.getElementById('signup_rPSW').value) {
		document.getElementById('span_test_1').innerHTML = 'Passwords should be the same!';
	}

	else if (document.getElementById('signup_PSW').value.length < 5 ) {
		document.getElementById('span_test_1').innerHTML ='Passwords should be at least 5 characters!';
	}

	else {
		signup_member();
	}

	return false;
}

//LGTM
var signup_member = function() {
	try {
		var new_member = {firstname: document.getElementById('signup_firstname').value,
											familyname: document.getElementById('signup_familyname').value,
											gender: document.getElementById('signup_gender').value,
											city: document.getElementById('signup_city').value,
											country: document.getElementById('signup_country').value,
											email: document.getElementById('signup_email').value,
											password: document.getElementById('signup_PSW').value};

		var req = new XMLHttpRequest();
		req.open("POST", "/contact/sign_up/", true);
		req.setRequestHeader("Content-type", "application/json");
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					if (response["success"]) {
						document.getElementById('span_test_1').innerHTML = response["message"];
						//localStorage.setItem("member", JSON.stringify(response)); //Question 1!
					}
					else {
						document.getElementById('span_test_1').innerHTML = response["message"];
					}
				}
				else if (this.status == 400){
        	document.getElementById('span_test_1').innerHTML = " ";
				}
			}
		};
		req.send(JSON.stringify(new_member));
	}
	catch(e){
		console.error(e);
	}
}

//LGTM
var login_member = function() {
	try{
		var user = {
			email : document.getElementById('login_email').value,
			password : document.getElementById('login_PSW').value
		};

		var req = new XMLHttpRequest();
		req.open("POST", "/contact/sign_in/", true);
		req.setRequestHeader("Content-type", "application/json");
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					if (response["success"]) {
						sessionStorage.setItem("token", JSON.stringify(response["data"]));
						localStorage.setItem("email", JSON.stringify(user["email"]));
						document.getElementById('content').innerHTML = document.getElementById('logged_in').innerHTML;
						document.getElementById("tabs-1").style.display = 'block';
						get_user_data_by_token();

						var connection = new WebSocket(`wss://${document.domain}/websocket`);
    				connection.onopen = function(){
        			message = {'token': JSON.parse(sessionStorage.getItem("token"))};
        			connection.send(JSON.stringify(message));
    				};
						connection.onmessage = function(e){
        			message = JSON.parse(e.data)['message']
        				if(message == 'Logged in from another device'){
            			sessionStorage.removeItem('token');
            			displayView();
        				}
    				};
    				connection.onclose = function(){
        			connection.close();
    				};
					}
					else{
						document.getElementById('span_test_3').innerHTML = response["message"];
          }
				}
				else if (this.status == 400){
          document.getElementById('span_test_3').innerHTML = "Something went wrong!";
        }
			}
		};
		req.send(JSON.stringify(user));
	}
	catch(e){
		console.error(e);
	}
}

//LGTM
var display_tab = function(element)  {
    var tab_panels = document.getElementsByClassName('tab_panel');
    for (var i = 0; i < tab_panels.length; i++) {
        tab_panels[i].style.display = 'none';
    }

    var tabContentIdToShow = element.id.replace(/(\d)/g, '-$1');
    document.getElementById(tabContentIdToShow).style.display = 'block';
}

//LGTM!
var changing_password = function() {
	try {
		var data = {
			oldPassword : document.getElementById("change_old_psw").value,
			newPassword : document.getElementById("change_new_psw").value,
			repeatPassword : document.getElementById("repeat_new_psw").value
		}
		token = JSON.parse(sessionStorage.getItem("token"));
		var req = new XMLHttpRequest();
		req.open("POST", "/account/Change_password/", true);
		req.setRequestHeader("Content-type", "application/json");
		req.setRequestHeader("token", token);
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					document.getElementById('span_test_4').innerHTML =response["message"];
				}
				else if (this.status == 400){
          document.getElementById('span_test_4').innerHTML = "Something went wrong";
        }
			}
		};
		req.send(JSON.stringify(data));
	}
	catch(e){
		console.error(e);
	}
	//CHECKING REQUIREMENTS TO CHANGE PSW-Maybe I use it later!!!
	//
	//if ( old_PSW != JSON.parse(localStorage.getItem("users"))[email].password ) {
	//	document.getElementById('span_test_4').innerHTML ="Password does not match";
	//}
	//else if (new_PSW.length < 5) {
	//	document.getElementById('span_test_4').innerHTML ='Passwords should be at least 5 characters!';
	//	}
	//else if (new_PSW != document.getElementById("repeat_new_psw").value) {
	//	document.getElementById('span_test_4').innerHTML ='Passwords should be the same!'
	//}
}//Here ends the changing_password function.


//LGTM!
var signOut = function() {
	try {
		token = JSON.parse(sessionStorage.getItem("token"));
		var req = new XMLHttpRequest();
		req.open("POST", "/contact/sign_out/", true);
		req.setRequestHeader("token", token);
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					if (response["success"]) {
						sessionStorage.removeItem("token");
						localStorage.removeItem("email");
						document.getElementById('content').innerHTML = document.getElementById('welcomeview').innerHTML;
					}
					else {
						document.getElementById('span_test_4').innerHTML = "Something went wrong";
					}
				}
				else if (this.status == 400){
          document.getElementById('span_test_4').innerHTML = "Something went wrong";
        }
			}
		};
		req.send(JSON.stringify(token));//Q3!
	}
	catch(e){
		console.error(e);
	}

}


//LGTM!
var get_user_data_by_token = function() {
	try {
		token = JSON.parse(sessionStorage.getItem("token"));
		var req = new XMLHttpRequest();
		req.open("GET", "/home/get_user_data_by_token/", true);
		req.setRequestHeader("token", token);
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					if (response["success"]) {
						document.getElementById("email_output").innerHTML = response["data"]["email"];
						document.getElementById("name_output").innerHTML = response["data"]["firstname"];
						document.getElementById("familyname_output").innerHTML = response["data"]["familyname"];
						document.getElementById("gender_output").innerHTML = response["data"]["gender"];
						document.getElementById("city_output").innerHTML = response["data"]["city"];
						document.getElementById("country_output").innerHTML = response["data"]["country"];
						post_to_own_wall();
					}
					else {
						console.log(response["message"])
					}
				}
				else if (this.status == 400){
          console.log("Something went wrong!")
        }
			}
		};
		req.send(JSON.stringify(token));//Q3!
	}
	catch(e){
		console.error(e);
	}
}

//LGTM
var get_user_data_by_email = function() {
	try {
		token = JSON.parse(sessionStorage.getItem("token"));
		var req = new XMLHttpRequest();
		req.open("GET", "/browse/get_user_data_by_email/" + document.getElementById('search_member').value, true);
		req.setRequestHeader("token", token);
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					if (response["success"]) {
						document.getElementById("email_output_2").innerHTML = response["data"]["email"];
						document.getElementById("name_output_2").innerHTML = response["data"]["firstname"];
						document.getElementById("familyname_output_2").innerHTML = response["data"]["familyname"];
						document.getElementById("gender_output_2").innerHTML = response["data"]["gender"];
						document.getElementById("city_output_2").innerHTML = response["data"]["city"];
						document.getElementById("country_output_2").innerHTML = response["data"]["country"];
						post_to_friend_wall();
					}
					else {
						console.log(response["message"])
					}
				}
				else if (this.status == 400){
          console.log("Something went wrong!")
        }
			}
		};
		req.send(JSON.stringify());
	}
	catch(e){
		console.error(e);
	}
}

//LGTM
var get_user_messages_by_token = function() {
	try {
		token = JSON.parse(sessionStorage.getItem("token"));
		var req = new XMLHttpRequest();
		req.open("GET", "/browse/Get_user_messages_by_token/", true);
		req.setRequestHeader("Content-type", "application/json");
		req.setRequestHeader("token", token);
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					if (response["success"]) {
						var text = ""
						messages = response["data"]
						for (i = 0; i < messages.length; i++) {
							if (messages[i]["content"] != "") {
								text += "<b>" + messages[i]["writer"] + "</b>" + ":" + messages[i]["content"] + "<br><br>";
							}
						}
						document.getElementById("theTextarea").innerHTML = text;
					}
					else {
						console.log(response["message"])
					}
				}
				else if (this.status == 400){
          console.log("Something went wrong!")
        }
			}
		};
		req.send(JSON.stringify());
	}
	catch(e){
		console.error(e);
	}
}


//LGTM
var get_user_messages_by_email = function() {
	try {
		token = JSON.parse(sessionStorage.getItem("token"));
		var req = new XMLHttpRequest();
		req.open("GET", "/browse/get_user_messages_by_email/"+document.getElementById('search_member').value, true);
		req.setRequestHeader("Content-type", "application/json");
		req.setRequestHeader("token", token);
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					if (response["success"]) {
						var text = ""
						messages = response["data"]
						for (i = 0; i < messages.length; i++) {
							if (messages[i]["content"] != "") {
								text += "<b>" + messages[i]["writer"] + "</b>" + ":" + messages[i]["content"] + "<br><br>";
							}
						}
						document.getElementById("theTextarea_2").innerHTML = text;
					}
					else {
						console.log(response["message"])
					}
				}
				else if (this.status == 400){
          console.log("Something went wrong!")
        }
			}
		};
		req.send(JSON.stringify());
	}
	catch(e){
		console.error(e);
	}
}


//LGTM
var post_to_own_wall = function() {
	try {
		token = JSON.parse(sessionStorage.getItem("token"));
		var data = {
			content : document.getElementById("wall_thoughts").value
		}
		var req = new XMLHttpRequest();
		req.open("POST", "/home/post_message/", true);
		req.setRequestHeader("Content-type", "application/json");
		req.setRequestHeader("token", token);
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					get_user_messages_by_token();
				}
				else if (this.status == 400){
          console.log("Something went wrong!")
        }
			}
		};
		req.send(JSON.stringify(data));
	}
	catch(e){
		console.error(e);
	}
}


//LGTM
var post_to_friend_wall = function() {
	try {
		token = JSON.parse(sessionStorage.getItem("token"));
		var data = {
			content : document.getElementById("wall_thoughts_2").value,
			email : document.getElementById("search_member").value
		}
		var req = new XMLHttpRequest();
		req.open("POST", "/home/post_message/", true);
		req.setRequestHeader("Content-type", "application/json");
		req.setRequestHeader("token", token);
		req.onreadystatechange = function(){
			if (this.readyState == 4){
				if (this.status == 200){
					var response = JSON.parse(req.responseText);
					document.getElementById("wall_thoughts_2").value = "";
					get_user_messages_by_email();
				}
				else if (this.status == 400){
          console.log("Something went wrong!")
        }
			}
		};
		req.send(JSON.stringify(data));
	}
	catch(e){
		console.error(e);
	}
}
