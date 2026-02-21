// src/utils/shieldLogic.ts

export interface SavingsVault {
  id: string;
  name: string;
  monthlyTarget: number;   
  currentBalance: number;  
  ceilingAmount: number | null; 
}

export interface ShieldResult {
  baseIncome: number;
  totalShielded: number;
  totalSpendable: number;
  vaultAllocations: { 
    vaultId: string; 
    allocated: number; 
    capped: boolean; 
  }[];
}

/**
 * Executes the core Fortis math to partition income between 
 * impenetrable savings vaults and the spendable front-line budget.
 */
export function partitionIncome(baseIncome: number, vaults: SavingsVault[]): ShieldResult {
  let totalShielded = 0;
  
  const vaultAllocations = vaults.map(vault => {
    let allocated = vault.monthlyTarget;
    let capped = false;

    // Apply Ceiling Validation (WBS 3.2 Logic)
    if (vault.ceilingAmount !== null) {
      const spaceLeft = vault.ceilingAmount - vault.currentBalance;
      
      if (spaceLeft <= 0) {
        // The vault is already full, redirect funds back to spendable
        allocated = 0;
        capped = true;
      } else if (allocated > spaceLeft) {
        // The vault only needs a partial amount to hit its ceiling
        allocated = spaceLeft;
        capped = true;
      }
    }

    totalShielded += allocated;
    return { vaultId: vault.id, allocated, capped };
  });

  // Safety Constraint: A user cannot shield more money than they actually make
  const finalShielded = Math.min(baseIncome, totalShielded);
  const totalSpendable = Math.max(0, baseIncome - finalShielded);

  return {
    baseIncome,
    totalShielded: finalShielded,
    totalSpendable,
    vaultAllocations
  };
}