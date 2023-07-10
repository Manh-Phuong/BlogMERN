import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";

export default function PostPage() {
  const [commentContent, setCommentContent] = useState("");
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();
  const [comments, setComments] = useState([]);

  const [showGoTopButton, setShowGoTopButton] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`)
      .then((response) => {
        response.json().then((postInfo) => {
          setPostInfo(postInfo);
          // setComments(postInfo.comments);
        });
      });
    
    fetch(`http://localhost:4000/postcomments/${id}`)
      .then((response) => response.json())
      .then((comments) => {
        setComments(comments);
      });
   
  }, []);

  const handleCommentChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handleCommentSubmit = () => {
    // Gọi API để gửi bình luận
    const commentData = {
      content: commentContent,
      post: id,
      author: userInfo.id, // Truyền userId từ thông tin người dùng hiện tại
    };
  
    fetch(`http://localhost:4000/comment/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    })
      .then((response) => response.json())
      .then((comment) => {
        // Xử lý khi bình luận được tạo thành công
        console.log("Comment created:", comment);
        // Reset input bình luận
        setCommentContent("");
        // Cập nhật danh sách các comment
        setComments([...comments, comment]);
      })
      .catch((error) => {
        console.error("Error creating comment:", error);
      });
  };
  

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowGoTopButton(true);
      } else {
        setShowGoTopButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleGoTopClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!postInfo) return "";

  return (
    <>
      <div className="post-page">
        <h1>{postInfo.title}</h1>
        <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
        <div className="author">Author: {postInfo.author.username}</div>
        {userInfo.id === postInfo.author._id && (
          <div className="edit-row">
            <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              Edit
            </Link>
          </div>
        )}
        <div className="image">
          <img src={`http://localhost:4000/${postInfo.cover}`} alt="" />
        </div>
        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: postInfo.content }}
        />
      </div>

      {showGoTopButton && (
        <button
          className={`go-top-button ${showGoTopButton ? "show" : ""}`}
          onClick={handleGoTopClick}
        >
          <svg
            width="16"
            data-e2e=""
            height="16"
            viewBox="0 0 48 48"
            fill="#FFF"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22.1086 20.3412C23.1028 19.2196 24.8972 19.2196 25.8914 20.3412L42.8955 39.5236C44.2806 41.0861 43.1324 43.5 41.004 43.5L6.99596 43.5C4.86764 43.5 3.71945 41.0861 5.10454 39.5235L22.1086 20.3412Z"
            ></path>
            <path d="M4.5 7.5C4.5 5.84315 5.84315 4.5 7.5 4.5L40.5 4.5C42.1569 4.5 43.5 5.84315 43.5 7.5C43.5 9.15685 42.1569 10.5 40.5 10.5L7.5 10.5C5.84315 10.5 4.5 9.15685 4.5 7.5Z"></path>
          </svg>
        </button>
      )}

      <div className="PostPage-comment">
        <h2>Comments</h2>
        <div>
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentContent}
            onChange={handleCommentChange}
          />
          <button onClick={handleCommentSubmit}>Submit</button>
        </div>
        {/* Hiển thị danh sách các comment */}
        {comments.map((comment) => (
          <div className="PostPage-comment-element" key={comment._id}>
            <h1>{ comment.author.username }</h1>
            {comment.content}
            </div>
        ))}
      </div>
    </>
  );
}
