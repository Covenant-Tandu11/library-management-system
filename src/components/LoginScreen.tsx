
import { BookOpenText, Mail, Lock, EyeClosed, LockKeyholeOpen } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import SuccessModal from './modals/SuccessModal'
import ErrorModal from './modals/ErrorModal'
import { supabase } from '../lib/supabase'
import { useState, type FormEvent } from 'react'

const LoginScreen = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [loginSucceeded, setLoginSucceeded] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoginError('')

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            setLoginSucceeded(true)
        } catch (error) {
            console.error('Login failed:', error)
            setLoginError(
                error instanceof Error ? error.message : 'Unable to log in. Please try again.',
            )
        }
    }
    return (
        <>
            <div className='grid min-h-screen grid-cols-1 md:h-screen md:min-h-0 md:grid-cols-[35%_65%] md:overflow-hidden'>
                <aside className='hidden h-screen bg-[#18212B] p-6 md:flex flex-col justify-between '>
                    <header className="flex items-center gap-2">
                        <BookOpenText className='text-[#FAF8F2]'/>
                        <div>
                            <h1 className='text-[#FAF8F2]'>UniLibrary</h1>
                            <p className='text-[#FAF8F2]'>Management System</p>
                        </div>
                    </header>
                    <div className='my-auto flex flex-col gap-3 px-3'>
                        <h1 className='text-[#FAF8F2] text-2xl font-bold'>Access Your Library Management System</h1>
                        <p className='text-[#FAF8F2] text-sm leading-6'>Sign in to manage books, students and transactions</p>
                    </div>
                </aside>
                <main className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F2] px-4 py-6 sm:px-8 sm:py-10 md:min-h-0 md:h-screen md:overflow-y-auto md:p-12">
                    <div className="mb-5 flex w-full max-w-md items-center gap-2 md:hidden">
                        <BookOpenText className="text-[#18212B]" />
                        <div>
                            <h2 className="text-sm font-semibold text-[#18212B]">UniLibrary</h2>
                            <p className="text-[10px] text-[#737780]">Management System</p>
                        </div>
                    </div>
                    <div className="flex w-full max-w-md flex-col gap-2 rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(24,33,43,0.08)] sm:p-8">
                        <h1 className='text-2xl text-[#20242B] font-bold'>Staff Login</h1>
                        <p className='text-base text-[#737780] font-normal'>Welcome back! Please enter your details to continue.</p>
                        <form action="" className='mt-4 flex flex-col gap-2' onSubmit={handleSubmit}>
                            <div className='flex flex-col gap-2.5'>
                                <label htmlFor="email" className='text-[#20242B] font-semibold text-sm'>Email Address</label>
                                <div className='flex items-center gap-3 border border-gray-300 bg-[#FAF8F2] px-4 py-3 rounded-lg'>
                                    <Mail className='text-gray-400' size={20}/>
                                    <input className='w-full outline-none' type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email address' id='email' name='email' autoComplete='email' required/>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2.5'>
                                <label htmlFor="password"  className='text-[#20242B] font-semibold text-sm'>Password</label>
                                <div className='flex items-center gap-3 border border-gray-300 bg-[#FAF8F2] px-4 py-3 rounded-lg'>
                                    <Lock className='text-gray-400'/>
                                    <input className=' min-w-0 flex-1 bg-transparent outline-none' type="password" value={password} onChange={(e) => setPassword(e.target.value)} id='password' name='password' placeholder='Enter your password' autoComplete='current-password' required/>
                                    <EyeClosed className='cursor-pointer text-gray-400'/>
                                </div>
                            </div>
                            <button type='submit' className='bg-[#18212B] text-[#FAF8F2] w-full rounded-2xl py-2 cursor-pointer'>Log In</button>
                            <p className='text-center text-sm sm:text-base'>Already have an account? <Link className='text-blue-500' to={'/'}>Sign Up</Link> </p>
                        </form>
                    </div>
                    
                </main>
            </div>
            {loginSucceeded && <SuccessModal  iconColor='text-green-700' iconBackgroundColor='bg-green-200' primaryButtonText='Go to Dashboard' onPrimaryClick={() => navigate('/dashboard')} subtitle='Welcome back! You have been successfully logged in.' icon={<LockKeyholeOpen size={32}/>} title='Login Successful'/>}
            {loginError && (
                <ErrorModal
                    title='Login failed'
                    message={loginError}
                    onClose={() => setLoginError('')}
                />
            )}
        </>
    )
}

export default LoginScreen
