import React, { useState, useEffect } from "react";
import Blog from "./components/Blog";
import Notification from "./components/Notification";
import blogService from "./services/blogs";
import loginService from "./services/login";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogAuthor, setNewBlogAuthor] = useState("");
  const [newBlogUrl, setNewBlogUrl] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);

  const [toggle, setToggle] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [notificationStyle, setNotificationStyle] = useState("notification");

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

  const addBlog = (event) => {
    event.preventDefault();

    const blogObject = {
      title: newBlogTitle,
      author: newBlogAuthor,
      url: newBlogUrl,
    };
    if (
      blogObject.title !== "" &&
      blogObject.author !== "" &&
      blogObject.url !== ""
    ) {
      blogService.create(blogObject).then((returnedBlog) => {
        setBlogs(blogs.concat(returnedBlog));
        setNewBlogTitle("");
        setNewBlogAuthor("");
        setNewBlogUrl("");
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

  const handleTitleChange = (event) => {
    console.log(event.target.value);
    setNewBlogTitle(event.target.value);
  };
  const handleAuthorChange = (event) => {
    console.log(event.target.value);
    setNewBlogAuthor(event.target.value);
  };
  const handleUrlChange = (event) => {
    console.log(event.target.value);
    setNewBlogUrl(event.target.value);
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
    <form onSubmit={handleLogin}>
      <div>
        Username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        Password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );

  const blogForm = () => (
    <>
      <div className="log">
        {user.username} is logged in
        <button onClick={handleLogout}>Logout</button>
      </div>
      <form onSubmit={addBlog}>
        <p>
          Title: <input value={newBlogTitle} onChange={handleTitleChange} />
        </p>
        <p>
          Author: <input value={newBlogAuthor} onChange={handleAuthorChange} />
        </p>
        <p>
          Url: <input value={newBlogUrl} onChange={handleUrlChange} />
        </p>
        <button type="submit">Create</button>
      </form>
    </>
  );

  return (
    <div>
      <h1>Blogs</h1>
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
