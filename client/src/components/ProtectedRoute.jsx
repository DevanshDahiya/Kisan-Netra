import { Navigate } from "react-router-dom";
import {useAuth} from '../context/AuthContent' ;


//  it is used for protecting the route 
export default function ProtectedRoute ({children ,roles}){
    const {user  , loading} = useAuth() ;

    if(loading) return  <div className="text-center mt-16">Loading...</div>;
    if(!user)   return <Navigate to='/login' replace /> 

    if(roles && !roles.includes(user.role)) {
        return <Navigate to='/' replace />
    }

    return children ;    
}