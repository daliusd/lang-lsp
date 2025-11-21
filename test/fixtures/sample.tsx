import React from 'react';

// React component test file for lang-lsp
// Hover over language keys to see translations

interface Props {
  userName: string;
}

export const WelcomeComponent: React.FC<Props> = ({ userName }) => {
  const welcomeKey = "user.welcome";
  const logoutKey = "user.logout";
  
  return (
    <div>
      <h1>{welcomeKey}</h1>
      <p>{`Hello, ${userName}!`}</p>
      <button>{`button.save`}</button>
      <button>{"button.cancel"}</button>
      <button>{"button.submit"}</button>
    </div>
  );
};

export const ErrorComponent: React.FC = () => {
  const errors = [
    "error.not-found",
    "error.unauthorized",
    "error.server"
  ];
  
  return (
    <div>
      {errors.map(error => (
        <div key={error}>{error}</div>
      ))}
    </div>
  );
};

export const MessageComponent: React.FC = () => {
  return (
    <div>
      <p className="success">{"message.success"}</p>
      <p className="warning">{"message.warning"}</p>
      <p className="info">{"message.info"}</p>
    </div>
  );
};
