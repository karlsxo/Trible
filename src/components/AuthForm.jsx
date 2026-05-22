import Button from './Button'
import Input from './Input'

const AuthForm = ({ role, mode, form, onChange, onSubmit, onToggleMode }) => {
  const isLogin = mode === 'login'

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {!isLogin ? (
        <Input
          label="Full Name"
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={onChange}
        />
      ) : null}
      {!isLogin && role === 'driver' ? (
        <Input
          label="Driver Number"
          name="driverNumber"
          placeholder="TRI-042"
          value={form.driverNumber}
          onChange={onChange}
        />
      ) : null}
      {isLogin ? (
        <Input
          label="Username"
          name="identifier"
          placeholder="username"
          value={form.identifier}
          onChange={onChange}
        />
      ) : (
        <Input
          label="Username"
          name="username"
          placeholder="Choose a username"
          value={form.username}
          onChange={onChange}
        />
      )}
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••"
        value={form.password}
        onChange={onChange}
      />
      <Button className="w-full" size="lg" type="submit">
        {isLogin ? 'Login' : 'Create account'}
      </Button>
      <button
        type="button"
        className="w-full text-xs text-slate-400 transition hover:text-white"
        onClick={onToggleMode}
      >
        {isLogin
          ? 'New here? Create an account'
          : 'Already have an account? Log in'}
      </button>
    </form>
  )
}

export default AuthForm
