import React from 'react';
import { FaBell } from 'react-icons/fa';
import styled from 'styled-components';

const BellContainer = styled.div`
  position: relative;
  display: inline-block;

  .badge {
    position: absolute;
    top: -5px;
    right: -7px;
    background-color: red;
    color: white;
    border-radius: 100%;
    font-size: 0.60em;
  }
`;

interface NotificationBellProps {
  count: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count }) => {
  return (
    <BellContainer>
      <FaBell size={25} />
      {count > 0 && <span className="badge">{count}</span>}
    </BellContainer>
  );
};

export default NotificationBell;
