export default function EnvCheckPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Environment Variables Check</h1>
      <p>
        <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
        {url ? `✅ ${url.substring(0, 30)}...` : '❌ NOT SET'}
      </p>
      <p>
        <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
        {key ? `✅ ${key.substring(0, 30)}...` : '❌ NOT SET'}
      </p>

      {!url || !key ? (
        <div style={{ padding: '1rem', background: '#fee', marginTop: '1rem', borderRadius: '4px' }}>
          <h3>⚠️ Configuration Issue</h3>
          <p>
            Environment variables are not set. In Railway, you must:
          </p>
          <ol>
            <li>Go to your Railway project dashboard</li>
            <li>Click the service (finbyx)</li>
            <li>Click "Variables"</li>
            <li>Add these variables:
              <ul>
                <li>NEXT_PUBLIC_SUPABASE_URL = (your Supabase URL)</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY = (your Supabase anon key)</li>
                <li>SUPABASE_SERVICE_ROLE_KEY = (your service role key)</li>
              </ul>
            </li>
            <li>The deployment will redeploy automatically</li>
            <li>Wait for the build to complete</li>
          </ol>
          <p>
            <strong>Important:</strong> The variables must be set BEFORE the build starts.
          </p>
        </div>
      ) : (
        <div style={{ padding: '1rem', background: '#efe', marginTop: '1rem', borderRadius: '4px' }}>
          <h3>✅ Configuration OK</h3>
          <p>Environment variables are properly set.</p>
        </div>
      )}
    </div>
  )
}
