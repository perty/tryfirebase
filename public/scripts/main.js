var theForm = document.getElementById("theForm");
var theFormInput = document.getElementById("theForm-input");
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var recentPostsSection = document.getElementById('recent-posts-list');
var listeningFirebaseRefs = [];

function addPost(text, picture) {
    var postData = {
        message: text,
        authorPic: picture
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('posts').push().key;

    var updates = {};
    updates['/posts/' + newPostKey] = postData;

    return firebase.database().ref().update(updates);
}

var currentUID;
function cleanupUi() {
    console.log("Clean up");
    listeningFirebaseRefs.forEach(function (ref) {
        ref.off();
    });
    listeningFirebaseRefs = [];
}

function createPostElement(message, authorPic) {
    var html = '<div class="content">' +
        '<span class="avatar"></span><span class="text"></span>' +
        '</div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    var postElement = div.firstChild;

    postElement.getElementsByClassName('text')[0].innerText = message;
    postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
        (authorPic || './silhouette.jpg') + '")';
    return postElement;
}

function startDatabaseQueries() {
    console.log("Starting database queries");
    var fetchPosts = function (postsRef, sectionElement) {
        postsRef.on('child_added', function (data) {
            console.log("Child added");
            var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
            containerElement.insertBefore(
                createPostElement(data.val().message, data.val().authorPic),
                containerElement.firstChild);
        });
    };

    var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
    fetchPosts(recentPostsRef, recentPostsSection);
    listeningFirebaseRefs.push(recentPostsRef);
}

function writeUserData(uid, displayName, email, photoURL) {
    firebase.database().ref('users/' + uid).set({
        username: displayName,
        email: email,
        profile_picture: photoURL
    });
}

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
    console.log("Change auth state");
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
            addPost(text, firebase.auth().currentUser.photoURL);
        }
        theFormInput.value = '';
    };
    loginHandling();
});
