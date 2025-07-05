import React from 'react';
import { string, bool, arrayOf, shape, number, func } from 'prop-types';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import { Form, PrimaryButton, FieldTextInput, ResponsiveImage } from '../../../components';

import css from './CommentThread.module.css';
import IconCollection from '../../../components/IconCollection/IconCollection';

const CommentItem = ({ comment }) => {
  const { user, content, date, likes, dislikes, isModerator } = comment;

  return (
    <div className={css.commentItem}>
      <div className={css.userInfo}>
        <ResponsiveImage
          url={user.avatar}
          alt={user.name}
          className={css.avatar}
        />
        <div className={css.userMeta}>
          <div className={css.nameRow}>
            <div>
              {isModerator && <> <span className={css.moderatorBadge}>Moderator</span>&nbsp;|&nbsp;</>}
              <span className={css.userName}>{user.name}&nbsp;|&nbsp;</span>
              <span className={css.date}>{date}</span>

            </div>
            <div className={css.actions}>
              <button className={css.actionButton}>
                <span className={css.likeCount}><IconCollection icon="icon-likes" /> {likes}</span>
              </button>
              <button className={css.actionButton}>
                <span className={css.dislikeCount}><IconCollection icon="icon-dislikes" /> {dislikes}</span>
              </button>
            </div>
          </div>
          <p className={css.content}>{content}</p>

        </div>
      </div>
    </div>
  );
};

const CommentThreadComponent = props => (
  <div className={css.root}>
    <h3 className={css.commentsTitle}>Comment Thread</h3>
    {/* Existing comments */}
    <div className={css.commentsContainer}>
      <div className={css.commentsList}>
        {props.comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>

    {/* Comment form */}
    <FinalForm
      onSubmit={props.onSubmit}
      render={({ handleSubmit }) => (
        <Form className={css.commentForm} onSubmit={handleSubmit}>
          <FieldTextInput
            className={css.commentInput}
            type="textarea"
            name="comment"
            id="comment"
            placeholder="Write your comment here..."
            validate={validators.required("Comment cannot be empty")}
          />
          <PrimaryButton type="submit" className={css.submitButton}>
            Add Comment
          </PrimaryButton>
        </Form>
      )}
    />
  </div>
);

CommentThreadComponent.defaultProps = {
  comments: [],
};

CommentThreadComponent.propTypes = {
  comments: arrayOf(
    shape({
      id: string.isRequired,
      user: shape({
        name: string.isRequired,
        avatar: string.isRequired,
      }).isRequired,
      content: string.isRequired,
      date: string.isRequired,
      likes: number,
      dislikes: number,
      isModerator: bool,
    })
  ),
  onSubmit: func.isRequired,
};

const CommentThread = injectIntl(CommentThreadComponent);

export default CommentThread;