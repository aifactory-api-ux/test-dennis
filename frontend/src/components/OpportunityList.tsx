import type { Opportunity } from '../types/opportunity';

interface OpportunityListProps {
  opportunities: Opportunity[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function OpportunityList({ opportunities, onEdit, onDelete }: OpportunityListProps) {
  if (opportunities.length === 0) {
    return <div>No opportunities found</div>;
  }

  return (
    <div className="opportunity-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Value</th>
            <th>Stage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => (
            <tr key={opp.id}>
              <td>{opp.name}</td>
              <td>{opp.company}</td>
              <td>${opp.value.toLocaleString()}</td>
              <td>{opp.stage}</td>
              <td>
                {onEdit && (
                  <button onClick={() => onEdit(opp.id)}>Edit</button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(opp.id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
