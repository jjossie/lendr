import React from 'react';
import {Box} from 'native-base';
import {ILoan, IRelation} from "../models/Relation";
import LoanContextItem from "./LoanContextItem";

export interface LoanContextProps {
  loans: ILoan[];
  relation: IRelation;
}

const LoanContext: React.FC<LoanContextProps> = ({loans, relation}) => {
  console.log("❇️< LoanContext >", JSON.stringify(loans, null, 2));
  if (!loans) return (<></>);
  return (
      <Box>
        {loans.map(loan => (
            <LoanContextItem key={loan.id} loan={loan} relation={relation} />
        ))}
      </Box>
  );
};

export default LoanContext;