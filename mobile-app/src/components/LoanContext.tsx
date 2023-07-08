import React from 'react';
import {Box} from 'native-base';
import {ILoan} from "../models/Relation";
import LoanContextItem from "./LoanContextItem";

export interface LoanContextProps {
  loans: ILoan[];
}

const LoanContext: React.FC<LoanContextProps> = ({loans}) => {
  return (
      <Box>
        {loans.map(loan => (
            <LoanContextItem key={loan.toolId} loan={loan} />
        ))}
      </Box>
  );
};

export default LoanContext;