export default function DebugVarsPage() {
  const allVars = Object.entries(process.env).filter(([key]) =>
    key.includes('SUPABASE') ||
    key.includes('FINERACT') ||
    key.includes('NEXT_PUBLIC')
  )

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '12px' }}>
      <h1>Environment Variables Debug</h1>
      <p>Total matching vars: {allVars.length}</p>
      <hr />
      {allVars.length === 0 ? (
        <div style={{ color: 'red', padding: '1rem', background: '#fee', borderRadius: '4px' }}>
          <h3>❌ NO ENVIRONMENT VARIABLES FOUND!</h3>
          <p>This means Railway didn't pass any env vars to the container.</p>
          <p>Check Railway dashboard:</p>
          <ol>
            <li>Service → finbyx</li>
            <li>Variables tab</li>
            <li>Ensure variables are SAVED (not just in form)</li>
            <li>Click "Redeploy" to force rebuild with env vars</li>
          </ol>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Variable</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {allVars.map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{key}</td>
                <td style={{ padding: '8px', wordBreak: 'break-all' }}>
                  {value && value.length > 50 ? `${value.substring(0, 50)}...` : value || '(empty)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr style={{ marginTop: '2rem' }} />
      <h3>Required Supabase Variables:</h3>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        <li>SUPABASE_SERVICE_ROLE_KEY</li>
      </ul>
    </div>
  )
}
