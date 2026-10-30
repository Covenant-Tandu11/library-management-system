
import { BookOpenText, User, UserPlus, Mail, Lock, EyeClosed, UserCheck, PartyPopper } from 'lucide-react'
import { Link } from 'react-router'
import { useNavigate } from 'react-router'
import SuccessModal from './modals/SuccessModal'
import ErrorModal from './modals/ErrorModal'
import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

const SignUpScreen = () => {
    const navigate = useNavigate()
    const [fullname, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [staffId, setStaffId] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    async function handleSignUp(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setErrorMessage('')

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.')
            return
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullname,
                        staff_id: staffId,
                    },
                },
            })

            if (error) throw error
            setShowRegistrationSuccess(true)
        } catch (error) {
            console.error('Sign up failed:', error)
            setErrorMessage(
                error instanceof Error ? error.message : 'Unable to complete registration. Please try again.',
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
                        <h1 className='text-[#FAF8F2] text-2xl font-bold'>Join UniLibrary</h1>
                        <p className='text-[#FAF8F2] text-sm leading-6'>Create your account to access the library management system.</p>
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
                        <h1 className='text-2xl text-[#20242B] font-bold'>Create Staff Account</h1>
                        <p className='text-base text-[#737780] font-normal'>Fill your details to get started.</p>
                        <form onSubmit={handleSignUp} className='mt-4 flex flex-col gap-2'>
                            <div className='flex flex-col gap-2.5'>
                                <label htmlFor="full-name" className='text-[#20242B] font-semibold text-sm'>Full Name</label>
                                <div className='flex items-center gap-3 border border-gray-300 bg-[#FAF8F2] px-4 py-3 rounded-lg'>
                                    <User className='text-gray-400' size={20}/>
                                    <input className='w-full outline-none' value={fullname} onChange={(e) => setFullName(e.target.value)} type="text" placeholder='Enter your full name' id='full-name' name='fullName' autoComplete='name' required/>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2.5'>
                                <label htmlFor="email-address" className='text-[#20242B] font-semibold text-sm'>Email Address</label>
                                <div className='flex items-center gap-3 border border-gray-300 bg-[#FAF8F2] px-4 py-3 rounded-lg'>
                                    <Mail className='text-gray-400' size={20}/>
                                    <input className='w-full bg-transparent outline-none' value={email} onChange={(e) => setEmail(e.target.value)} type="email" id='email-address' name='email' placeholder='Enter your email address' autoComplete='email' required/>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2.5'>
                                <label htmlFor="staff-id" className='text-[#20242B] font-semibold text-sm'>Staff ID</label>
                                <div className='flex items-center gap-3 border border-gray-300 bg-[#FAF8F2] px-4 py-3 rounded-lg'>
                                    <UserPlus className='text-gray-400' size={20}/>
                                    <input className='w-full bg-transparent outline-none' value={staffId} onChange={(event) => setStaffId(event.target.value)} type="text" id='staff-id' name='staffId' placeholder='STF-0000' pattern='STF-[0-9]{4}' title='Enter a staff ID in the format STF-1234.' required/>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2.5'>
                                <label htmlFor="password"  className='text-[#20242B] font-semibold text-sm'>Password</label>
                                <div className='flex items-center gap-3 border border-gray-300 bg-[#FAF8F2] px-4 py-3 rounded-lg'>
                                    <Lock className='text-gray-400'/>
                                    <input value={password} onChange={(event) => {
                                        setPassword(event.target.value)
                                    }} className=' min-w-0 flex-1 bg-transparent outline-none' type="password" id='password' name='password' placeholder='Enter your password' autoComplete='new-password' required/>
                                    <EyeClosed className='cursor-pointer text-gray-400'/>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2.5'>
                                <label htmlFor="confirm-password"  className='text-[#20242B] font-semibold text-sm'>Confirm Password</label>
                                <div className='flex items-center gap-3 border border-gray-300 bg-[#FAF8F2] px-4 py-3 rounded-lg'>
                                    <Lock className='text-gray-400'/>
                                    <input value={confirmPassword} onChange={(event) => {
                                        setConfirmPassword(event.target.value)
                                    }} className=' min-w-0 flex-1 bg-transparent outline-none' type="password" id='confirm-password' name='confirmPassword' placeholder='Confirm your password' autoComplete='new-password' required/>
                                    <EyeClosed className='cursor-pointer text-gray-400'/>
                                </div>
                            </div>

                            <button type='submit' className='bg-[#18212B] text-[#FAF8F2] w-full rounded-2xl py-2 cursor-pointer'>Sign Up</button>
                            <p className='text-center text-sm sm:text-base'>Already have an account? <Link className='text-blue-500' to={'/loginScreen'}>Login</Link> </p>
                        </form>
                    </div>
                    
                </main>
            </div>
            {showRegistrationSuccess && <SuccessModal iconColor='text-green-700' iconBackgroundColor='bg-green-200' primaryButtonText='Go to Login' onPrimaryClick={() => navigate('/loginScreen')} subtitle='Your account has been created. Check your email and follow the verification link to complete registration.' icon={<UserCheck  size={32}/>} title='Check Your Email'>
                    <div className='bg-green-300 text-green-700 h-10 w-10 flex items-center justify-center rounded-full'>
                        <PartyPopper size={24}/>
                    </div>
                    <div>
                        <h3 className='text-[#20242B] font-bold'>Complete your registration</h3>
                        <p className='text-[#737780]'>Open the verification email sent to {email} and follow its instructions.</p>
                    </div>
            </SuccessModal>}
            {errorMessage && (
                <ErrorModal
                    title='Registration failed'
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}
        </>
    )
}

export default SignUpScreen
