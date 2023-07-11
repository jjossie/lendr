import React from 'react';
import {Box} from 'native-base';
import {ILoan} from "../models/Relation";
import LoanContextItem from "./LoanContextItem";

export interface LoanContextProps {
  loans: ILoan[];
}

const LoanContext: React.FC<LoanContextProps> = ({loans}) => {
  console.log("❇️< LoanContext >", JSON.stringify(loans, null, 2));
  if (!loans) return (<></>);
  return (
      <Box>
        {loans.map(loan => (
            <LoanContextItem key={loan.id} loan={loan} />
        ))}
      </Box>
  );
};

export default LoanContext;