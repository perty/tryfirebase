var theForm = document.getElementById("theForm");
var theFormInput = document.getElementById("theForm-input");
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');

function addPost(text) {
    var postData = {
        message: text
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/posts/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}

var currentUID;
function cleanupUi() {

}
/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
    // We ignore token refresh events.
    if (user && currentUID === user.uid || !user && currentUID === null) {
        return;
    }
    currentUID = user ? user.uid : null;

    cleanupUi();
    if (user) {
        splashPage.style.display = 'none';
        writeUserData(user.uid, user.displayName, user.email, user.photoURL);
        startDatabaseQueries();
    } else {
        // Display the splash page where you can sign-in.
        splashPage.style.display = '';
    }
}

// Bindings on load.
function loginHandling() {
    // Bind Sign in button.
    signInButton.addEventListener('click', function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider);
    });

    // Bind Sign out button.
    signOutButton.addEventListener('click', function () {
        firebase.auth().signOut();
    });

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(onAuthStateChanged);
}
window.addEventListener('load', function () {
    theForm.onsubmit = function (e) {
        e.preventDefault();
        var text = theFormInput.value;
        if (text) {
            addPost(text);
        }
        theFormInput.value = '';
    };
    loginHandling();
});
