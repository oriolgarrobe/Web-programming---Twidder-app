from flask import Flask, request, jsonify, send_from_directory
import database_helper
import json
import string
import random
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler

app = Flask(__name__)

app.debug = True

@app.teardown_request
def after_request(exception):
    database_helper.disconnect_db()

@app.route('/')
def root():
    return send_from_directory('static', 'client.html')


def randomToken(stringLength):
    lettersAndDigits = string.ascii_letters + string.digits
    return ''.join(random.choice(lettersAndDigits) for i in range(stringLength))

@app.route('/contact/sign_in/', methods=['POST'])
def sign_in():
    data = request.get_json()
    if data['email'] in logged_in_users:
        msg = {
            'message': 'Logged in from another device'
        }
        try:
            logged_in_users[data['email']].send(json.dumps(msg))
            del logged_in_users[data['email']]
            database_helper.delete_loggedinuser(data['email'])
        except:
            pass

    if 'email' in data and 'password' in data:
        contact = database_helper.get_contact(data['email'])[0]
        if contact and contact['password'] == data['password']:
            token = randomToken(30)
        else:
            return json.dumps({"success": "false", "message": "Wrong username or password."}), 400

        result = database_helper.sign_in(contact['email'], token)
        if result:
            return json.dumps({"success": "true", "message": "Successfully signed in.", "data": token}), 200
        else:
            return json.dumps({"success": "false", "message": "Wrong username or password."}), 400
    else:
        return json.dumps({"success": "false", "message": "Empty field!"}), 400


@app.route('/contact/sign_up/', methods=['POST'])
def sign_up():
    data = request.get_json()
    if 'firstname' in data and 'familyname' in data and 'gender' in data and 'city' in data and 'country' in data and 'email' in data and 'password' in data:
        if 0< len(data['firstname']) <= 100 and 0< len(data['familyname']) <= 100 and 0< len(data['gender']) <= 30 and 0< len(data['city']) <= 30 and 0< len(data['country']) <= 30 and 0< len(data['email']) <= 30 and 5 <= len(data['password']) <= 30:
            result = database_helper.sign_up(data['firstname'], data['familyname'],data['gender'],
                                             data['city'], data['country'], data['email'], data['password'])
            if result == True:
                return json.dumps({"success": "true","message":"Successfully created a new user."}), 200
            else:
                return json.dumps({"success": "false", "message": "Something went wrong!"}), 500
        else:
            return json.dumps({"success": "false", "message": "Empty field!"}), 400
    else:
        return json.dumps({"success": "false", "message": "Missing field!"}), 400




@app.route('/contact/sign_out/', methods=['POST'])
def sign_out():
    data = request.get_json()
    token = request.headers.get('token')
    if token and database_helper.check_token(token):
        result = database_helper.sign_out(token)
        if result == True:
            return json.dumps({"success": "true","message":"Successfully signed out."}), 200
        else:
            return json.dumps({"success": "false", "message": "Something went wrong!"}), 500
    else:
        return json.dumps({"success": "false", "message": "Something went wrong!"}), 400


@app.route('/account/Change_password/', methods=['POST'])
def Change_password():
    data = request.get_json()
    token=request.headers.get('token')
    if token and 'oldPassword' in data and 'newPassword' in data and database_helper.check_token(token):
        email = database_helper.get_email_from_token(token)
        old_password = database_helper.get_old_password(email)
        if data['oldPassword'] == old_password and 5 <= len(data['newPassword']) <= 30 and data['newPassword']==data['repeatPassword']:
            result = database_helper.Change_password(token, data['newPassword'])
            if result == True:
                return json.dumps({"success": "true", "message": "Password changed!"}), 200
            else:
                return json.dumps({"success": "false", "message": "Something wxent wrong!"}), 500
        else:
            return json.dumps({"success": "false", "message": "Check again your password!"}), 400
    else:
        return json.dumps({"success": "false", "message": "Missing field!"}), 400


@app.route('/home/get_user_data_by_token/', methods=['GET'])
def get_user_data_by_token():
    token = request.headers.get('token')
    if token and database_helper.check_token(token):
        email = database_helper.get_email_from_token(token)
        print(email)
        result = database_helper.get_user_data_by_email(email)
        if result:
            return json.dumps({"success": "true", "message": "User data retrieved.", "data": result[0]}), 200
        else:
            return json.dumps({"success": "false", "message": "Something went wrong!"}), 500
    else:
        return json.dumps({"success": "false", "message": "Something went wrong!"}), 400


@app.route('/browse/get_user_data_by_email/<email>', methods=['GET'])
def get_user_data_by_email(email):
    token = request.headers.get('token')
    if token and database_helper.check_token(token):
        result = database_helper.get_user_data_by_email(email)
        if result:
            return json.dumps({"success": "true", "message": "User data retrieved.", "data": result[0]}), 200
        else:
            return json.dumps({"success": "false", "message": "Something went wrong!"}), 500
    else:
        return json.dumps({"success": "false", "message": "Something went wrong!"}), 400


@app.route('/browse/Get_user_messages_by_token/', methods=['GET'])
def Get_user_messages_by_token():
    token = request.headers.get('token')
    if token and database_helper.check_token(token):
        email = database_helper.get_email_from_token(token)
        result = database_helper.get_user_messages_by_email(email)
        if result:
            return json.dumps({"success": "true", "message": "User messages retrieved.", "data": result}), 200
        else:
            return json.dumps({"success": "false", "message": "Something went wrong!"}), 500
    else:
        return json.dumps({"success": "false", "message": "Something went wrong!"}), 400


@app.route('/browse/get_user_messages_by_email/<email>', methods=['GET'])
def get_user_messages_by_email(email):
    token = request.headers.get('token')
    if token and database_helper.check_token(token):
        result = database_helper.get_user_messages_by_email(email)
        if result:
            return json.dumps({"success": "true", "message": "User messages retrieved.", "data": result}), 200
        else:
            return json.dumps({"success": "false", "message": "Something went wrong!"}), 500
    else:
        return json.dumps({"success": "false", "message": "Something went wrong!"}), 400

@app.route('/home/post_message/', methods=['POST'])
def post_message():
    data = request.get_json()
    token = request.headers.get('token')
    if token and 'content' in data and 'email' not in data and database_helper.check_token(token):
        email = database_helper.get_email_from_token(token)
        writer = email
        result = database_helper.post_message(email, writer, data['content'])
        if result == True:
            return json.dumps({"success": "true", "message": "Message posted"}), 200
        else:
            return json.dumps({"success": "false", "message": "Something went wrong!"}), 500
    elif token and 'email' in data and 'content' in data and database_helper.check_token(token):
        writer = database_helper.get_email_from_token(token)
        result = database_helper.post_message(data['email'], writer, data['content'])
        if result == True:
            return json.dumps({"success": "true", "message": "Message posted"}), 200
        else:
            return json.dumps({"success": "false", "message": "Something went wrong!"}), 500
    else:
        return json.dumps({"success": "false", "message": "Missing field"}), 400

##NOT definitve

logged_in_users = {}

@app.route('/websocket')
def check_websocket():
    if request.environ.get('wsgi.websocket'):
        web_socket = request.environ['wsgi.websocket']
        message = json.loads(web_socket.receive()) ##I want to check this message
        email = database_helper.get_email_from_token(message['token']) ##GET THE EMAIL SOMEHOW
        logged_in_users[email] = web_socket
        print("WSGI FOUND")
        while True:
            message = web_socket.receive()
            if message is not None:
                message = {'message': 'Successfully logged in'}
                web_socket.send(json.dumps(message))
                print("message received")
        try:
            del logged_in_users[email]
        except:
            pass
    return 'None'
##Not definitive

if __name__ == '__main__':
    #app.run(port=5000)
    http_server = WSGIServer(('127.0.0.1',5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
