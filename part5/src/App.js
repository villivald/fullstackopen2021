import React, { useState, useEffect } from "react";
import Blog from "./components/Blog";
import Notification from "./components/Notification";
import blogService from "./services/blogs";
import loginService from "./services/login";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Togglable from "./components/Togglable";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);

  const [toggle, setToggle] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [notificationStyle, setNotificationStyle] = useState("notification");

  // EFFECTS
  useEffect(() => {
    blogService.getAll().then((initialBlogs) => {
      setBlogs(initialBlogs);
    });
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  // ADDING BLOG OBJECT
  const addBlog = (blogObject) => {
    if (
      blogObject.title !== "" &&
      blogObject.author !== "" &&
      blogObject.url !== ""
    ) {
      blogService.create(blogObject).then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog));
      });

      setNotificationStyle("notification");
      setNotificationText(
        `A new blog ${blogObject.title} by ${blogObject.author} added`
      );
      setToggle(!toggle);
      setTimeout(() => {
        setToggle(false);
      }, 5000);
    } else {
      setNotificationStyle("warning");
      setNotificationText("You must fill all fields in order to add a blog");
      setToggle(!toggle);
      setTimeout(() => {
        setToggle(false);
      }, 5000);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({
        username,
        password,
      });
      window.localStorage.setItem("loggedBlogUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
      setNotificationStyle("notification");
      setNotificationText(`User ${user.username} is logged in`);
      setToggle(!toggle);
      setTimeout(() => {
        setToggle(false);
      }, 5000);
    } catch (exception) {
      setNotificationStyle("warning");
      setNotificationText("Wrong username or password");
      setToggle(!toggle);
      setTimeout(() => {
        setToggle(false);
      }, 5000);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedBlogUser");
    document.location.reload();
  };

  const loginForm = () => (
    <Togglable buttonLabel="Log in">
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  );

  const blogForm = () => (
    <Togglable buttonLabel="New blog">
      <BlogForm createBlog={addBlog} />
    </Togglable>
  );

  return (
    <div>
      <h1>Blogs</h1>
      {user && (
        <div className="log">
          {user.username} is logged in
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      {toggle && (
        <Notification text={notificationText} style={notificationStyle} />
      )}
      {user === null ? (
        loginForm()
      ) : (
        <>
          {blogForm()}
          <ul>
            {blogs
              .filter((blog) => blog.user.username === user.username)
              .map((blog) => (
                <Blog key={blog.id} blog={blog} />
              ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default App;
