import React from 'react';
import {Box, useTheme} from 'native-base';
import {Loan, Relation} from "../models/relation";
import LoanContextItem from "./LoanContextItem";
import Carousel from "./utilities/Carousel";

export interface LoanContextProps {
  loans: Loan[];
  relation: Relation;
}

const LoanContext: React.FC<LoanContextProps> = ({loans, relation}) => {
  console.log("❇️< LoanContext >", JSON.stringify(loans, null, 2));

  const {colors} = useTheme();

  if (!loans) return (<></>);
  return (
      <Box>
        <Carousel bgColor={colors.light[100]} items={loans.map(loan => (
            <LoanContextItem key={loan.id} loan={loan} relation={relation} />
        ))}/>
      </Box>
  );
};

export default LoanContext;