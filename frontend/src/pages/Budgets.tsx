import React from 'react';
import { useNavigate } from 'react-router-dom';

const Budgets: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect to procurements page since budgets are now part of procurements
    navigate('/procurements', { replace: true });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
    </div>
  );
};

export default Budgets;
