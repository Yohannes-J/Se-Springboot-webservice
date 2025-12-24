// 1. Updated component to check for both Token AND Role permissions
function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = localStorage.getItem("token"); 
  const userRole = localStorage.getItem("role"); // Get the role saved during login
  
  // First check: Is the user even logged in?
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Second check: If specific roles are required, does the user have them?
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If a USER tries to access an ADMIN page, send them to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppWrapper() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<AuthPage />} />

      {/* Private Routes Wrapper */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* --- SHARED ACCESS (USER & ADMIN) --- */}
                <Route path="/dashboard" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/borrow" element={<Borrow />} />
                <Route path="/return" element={<ReturnBook />} />
                <Route path="/penality" element={<Penality />} />

                {/* --- ADMIN ONLY ACCESS --- */}
                <Route 
                  path="/admin" 
                  element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} 
                />
                <Route 
                  path="/customer" 
                  element={<ProtectedRoute allowedRoles={["ADMIN"]}><Customer /></ProtectedRoute>} 
                />
                <Route 
                  path="/assign-role" 
                  element={<ProtectedRoute allowedRoles={["ADMIN"]}><AssignRole /></ProtectedRoute>} 
                />
                <Route 
                  path="/books/add" 
                  element={<ProtectedRoute allowedRoles={["ADMIN"]}><AddBook /></ProtectedRoute>} 
                />

                <Route path="*" element={<div>404 Not Found</div>} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}