displayView = function(){
	// the code required to display a view

};
window.onload = function(){
			document.getElementById('content').innerHTML = document.getElementById('welcomeview').innerHTML;
};


var validate_signup = function() {

	if (document.getElementById('signup_PSW').value != document.getElementById('signup_rPSW').value) {
		window.alert('Passwords should be the same!');
	}

	else if (document.getElementById('signup_PSW').value.length < 5 ) {
		window.alert('Passwords should be at least 5 characters!');
	}

	else {
		signup_member();
	}
}

var signup_member = function() {
	new_member = {firstname: document.getElementById('signup_firstname').value,
	familyname: document.getElementById('signup_familyname').value,
	gender: document.getElementById('signup_gender').value,
	city: document.getElementById('signup_city').value,
	country: document.getElementById('signup_country').value,
	email: document.getElementById('signup_email').value,
	password: document.getElementById('signup_PSW').value};

	user = localStorage.setItem("user", JSON.stringify(serverstub.signUp(new_member)));
	response = JSON.parse(localStorage.getItem("user"));

	if (response.success) {
		window.alert(response.message)
	}
	else {
		window.alert(response.message);
	}
}

var login_member = function() {
	email_member = document.getElementById('login_email').value;
	password_member = document.getElementById('login_PSW').value;

	member = localStorage.setItem("member", JSON.stringify(serverstub.signIn(email_member, password_member)));
	answer = JSON.parse(localStorage.getItem("member"));

	if (answer.success) {
		document.getElementById('content').innerHTML = document.getElementById('logged_in').innerHTML;
		document.getElementById("tabs-1").style.display = 'block';
		user_data();
		post_to_wall();
	}
	else {
		window.alert("dfg");
	}

}

var display_tab = function(element)  {
    var tab_panels = document.getElementsByClassName('tab_panel');
    for (var i = 0; i < tab_panels.length; i++) {
        tab_panels[i].style.display = 'none';
    }

    var tabContentIdToShow = element.id.replace(/(\d)/g, '-$1');
    document.getElementById(tabContentIdToShow).style.display = 'block';
}

var changing_password = function() {
  token = JSON.parse(localStorage.getItem("member")).data;
	email = JSON.parse(localStorage.getItem("loggedinusers"))[token];
	old_PSW = document.getElementById("change_old_psw").value;
	new_PSW = document.getElementById("change_new_psw").value;

	if ( old_PSW != JSON.parse(localStorage.getItem("users"))[email].password ) {
		window.alert("Password does not match");
	}
	else if (new_PSW.length < 5) {
		window.alert('Passwords should be at least 5 characters!');
		}
	else if (new_PSW != document.getElementById("repeat_new_psw").value) {
		window.alert('Passwords should be the same!');
	}
	else {
		psw_data = localStorage.setItem("psw_data", JSON.stringify(serverstub.changePassword(token, old_PSW, new_PSW)));
		psw_output = JSON.parse(localStorage.getItem("psw_data"));
		window.alert(psw_output.message)
	}
}


var signOut = function() {
	token = JSON.parse(localStorage.getItem("member")).data;
	signout_data = localStorage.setItem("signout_data", JSON.stringify(serverstub.signOut(token)));
	signout_output = JSON.parse(localStorage.getItem("signout_data"));
	if (signout_output.success) {
		document.getElementById('content').innerHTML = document.getElementById('welcomeview').innerHTML;
	}
}

var user_data = function() {
	token = JSON.parse(localStorage.getItem("member")).data;
	getuser_data = localStorage.setItem("getuser_data", JSON.stringify(serverstub.getUserDataByToken(token)));
	getuser_output = JSON.parse(localStorage.getItem("getuser_data"));
  document.getElementById("email_output").innerHTML = getuser_output.data.email;
	document.getElementById("name_output").innerHTML = getuser_output.data.firstname;
	document.getElementById("familyname_output").innerHTML = getuser_output.data.familyname;
	document.getElementById("gender_output").innerHTML = getuser_output.data.gender;
	document.getElementById("city_output").innerHTML = getuser_output.data.city;
	document.getElementById("country_output").innerHTML = getuser_output.data.country;
}

var post_to_wall = function() {
	token = JSON.parse(localStorage.getItem("member")).data;
	email = JSON.parse(localStorage.getItem("loggedinusers"))[token];
	message = document.getElementById("wall_thoughts").value;

	wall_data =  localStorage.setItem("wall_data", JSON.stringify(serverstub.postMessage(token, message, email)));
	wall_output = JSON.parse(localStorage.getItem("wall_data"));

	user_messages = localStorage.setItem("user_messages", JSON.stringify(serverstub.getUserMessagesByToken(token)));
	user_output = JSON.parse(localStorage.getItem("user_messages"));

	var text = "<b>" + email + "</b>"+ "<br><br>"
	for (i = 0; i < user_output.data.length; i++) {
		text += user_output.data[i].content + "<br><br>";
	}

	document.getElementById("theTextarea").innerHTML = text;
}
