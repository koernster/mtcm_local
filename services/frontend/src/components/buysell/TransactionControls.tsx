import React from 'react';
import { Button } from 'react-bootstrap';
import { FaArrowDownUpAcrossLine, FaMagnifyingGlass, FaPlus } from 'react-icons/fa6';
import { StyledFormControl } from '../styled/CommonStyled';
import { Small } from '../styled/TypographyStyled';
import InputWrapper from '../common/InputWrapper';
import CouponDatesButton from './CouponDatesButton';
import { SortingState, OnChangeFn } from '@tanstack/react-table';

interface TransactionControlsProps {
    transactionCount: number;
    sorting: SortingState;
    setSorting: OnChangeFn<SortingState>;
    couponDates: Date[];
    showCouponDates: boolean;
    setShowCouponDates: (show: boolean) => void;
    onAddNew: () => void;
    onCancelNew?: () => void;
    isAddingNew: boolean;
}

const TransactionControls: React.FC<TransactionControlsProps> = ({
    transactionCount,
    sorting,
    setSorting,
    couponDates,
    showCouponDates,
    setShowCouponDates,
    onAddNew,
    onCancelNew,
    isAddingNew
}) => {
    return (
        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'left' }}>
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                {!isAddingNew ? (
                    <>
                        <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={onAddNew}
                        >
                            <FaPlus style={{ marginRight: '6px' }} />
                            Add New
                        </Button>
                        
                        <InputWrapper 
                            leftIcon={<FaMagnifyingGlass />}
                            style={{ width: '180px', marginLeft: '0.5rem' }}
                        >
                            <StyledFormControl 
                                size='sm'
                                type="text"
                                placeholder="Search"
                                disabled={isAddingNew}
                            />
                        </InputWrapper>
                    </>
                ) : (
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={onCancelNew}
                    >
                        Cancel
                    </Button>
                )}
            </div> 
            
            {/* Table Controls */}
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <Small style={{ marginRight: '0.5rem' }}>
                    {isAddingNew 
                        ? 'Creating new transaction...' 
                        : `${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}`
                    }
                </Small>
                {sorting.length > 0 && (
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => setSorting([])}
                        disabled={isAddingNew}
                    >
                        <FaArrowDownUpAcrossLine style={{ marginRight: '6px' }} />
                        Clear Sort
                    </Button>
                )}
                <CouponDatesButton 
                    couponDates={couponDates}
                    showCouponDates={showCouponDates}
                    setShowCouponDates={setShowCouponDates}
                />
            </div>
        </div>
    );
};

export default TransactionControls;
