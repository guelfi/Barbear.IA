import { useState, useRef, useEffect } from "react";
import { MaterialButton } from "../ui/material-button";
import {
  MaterialCard,
  MaterialCardContent,
  MaterialCardDescription,
  MaterialCardHeader,
  MaterialCardTitle,
} from "../ui/material-card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { ThemeToggle } from "../ui/theme-toggle";
import { motion } from "motion/react";
// ImageWithFallback import removed as it is unused
import { useAuth } from "../../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Scissors,
  Users,
  Shield,
  UserCheck,
} from "lucide-react";
import { AnimatedIcon } from "../ui/animated-icon";
import { toast } from "sonner";
import { LoginCredentials, RegisterData } from "../../types";
import { formatPhoneBrazil, validateEmail, validatePhone } from "../../lib/validation";

export function AuthForm() {
  const [activeTab, setActiveTab] = useState("login");
  // unused state removed
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  // Refs para auto-focus
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const registerNameRef = useRef<HTMLInputElement>(null);
  
  // Estados para animação de typewriter
  const [showLoginTypewriter, setShowLoginTypewriter] = useState(false);
  const [loginTypewriterText, setLoginTypewriterText] = useState("");
  const [showRegisterTypewriter, setShowRegisterTypewriter] = useState(false);
  const [registerTypewriterText, setRegisterTypewriterText] = useState("");
  
  // Estados para validação em tempo real
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);

  // Login form
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: "",
    password: "",
    userType: undefined as any, // Nenhum tipo selecionado por padrão
  });

  // Register form
  const [registerData, setRegisterData] =
    useState<RegisterData>({
      name: "",
      email: "",
      password: "",
      phone: "",
      userType: undefined as any, // Nenhum tipo selecionado por padrão
      businessName: "",
      address: "",
      preferredLocation: "",
    });

  const { login, register, isLoading } = useAuth();

  // Typewriter effect para login
  useEffect(() => {
    if (activeTab === "login" && loginData.userType && !loginData.email) {
      setShowLoginTypewriter(true);
      const message = "Digite seu email";
      let currentIndex = 0;
      
      const typewriterInterval = setInterval(() => {
        if (currentIndex <= message.length) {
          setLoginTypewriterText(message.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typewriterInterval);
          // Após completar, aguardar 3 segundos e então focar
          setTimeout(() => {
            loginEmailRef.current?.focus();
          }, 3000);
        }
      }, 80); // 80ms entre cada letra
      
      return () => clearInterval(typewriterInterval);
    } else if (loginData.email) {
      setShowLoginTypewriter(false);
      setLoginTypewriterText("");
    }
  }, [loginData.userType, loginData.email, activeTab]);

  // Typewriter effect para registro
  useEffect(() => {
    if (activeTab === "register" && registerData.userType && !registerData.name) {
      setShowRegisterTypewriter(true);
      const message = "Digite seu nome";
      let currentIndex = 0;
      
      const typewriterInterval = setInterval(() => {
        if (currentIndex <= message.length) {
          setRegisterTypewriterText(message.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typewriterInterval);
          // Após completar, aguardar 3 segundos e então focar
          setTimeout(() => {
            registerNameRef.current?.focus();
          }, 3000);
        }
      }, 80);
      
      return () => clearInterval(typewriterInterval);
    } else if (registerData.name) {
      setShowRegisterTypewriter(false);
      setRegisterTypewriterText("");
    }
  }, [registerData.userType, registerData.name, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar se um tipo de usuário foi selecionado
    if (!loginData.userType) {
      setError("Por favor, selecione o tipo de usuário");
      return;
    }

    const success = await login(
      loginData.email,
      loginData.password,
      loginData.userType,
    );
    if (!success) {
      setError("Email ou senha incorretos");
    }
  };

  // Handler para mudança de email com validação
  const handleEmailChange = (email: string, isLogin: boolean = false) => {
    if (isLogin) {
      setLoginData({ ...loginData, email });
    } else {
      setRegisterData({ ...registerData, email });
      if (email.length > 0) {
        setEmailValid(validateEmail(email));
      } else {
        setEmailValid(null);
      }
    }
  };
  
  // Handler para mudança de telefone com máscara e validação
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneBrazil(value);
    setRegisterData({ ...registerData, phone: formatted });
    
    if (formatted.length > 0) {
      setPhoneValid(validatePhone(formatted));
    } else {
      setPhoneValid(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar se um tipo de usuário foi selecionado
    if (!registerData.userType) {
      setError("Por favor, selecione o tipo de usuário");
      return;
    }

    // Validar email
    if (!validateEmail(registerData.email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    // Validar telefone
    if (!validatePhone(registerData.phone)) {
      setError("Por favor, insira um telefone válido");
      return;
    }

    if (registerData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    const success = await register(registerData);
    if (success) {
      if (registerData.userType === "barbershop") {
        toast.success(
          "Cadastro realizado! Sua barbearia está em análise. Você tem 7 dias para testar o sistema.",
        );
      } else {
        toast.success(
          "Cadastro realizado com sucesso! Faça login para continuar.",
        );
      }
      setActiveTab("login");
    } else {
      setError("Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-background p-4 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Theme Toggle */}
      <motion.div
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <ThemeToggle />
      </motion.div>
      <motion.div
        className="w-full max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              type: "tween",
              ease: "easeOut"
            }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="relative"
              animate={{ 
                rotate: [0, 15, -15, 10, -5, 0],
                scale: [1, 1.1, 1, 1.05, 1.02, 1],
                y: [0, -2, 0, -1, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.2, 0.4, 0.6, 0.8, 1]
              }}
              whileHover={{
                rotate: [0, -15, 15, -10, 10, 0, 180, 360],
                scale: [1, 1.3, 1.2, 1.25, 1.1, 1.15, 1.2, 1],
                y: [0, -5, -3, -4, -2, -3, -1, 0],
                transition: { 
                  duration: 1.2,
                  ease: "easeInOut"
                }
              }}
              whileTap={{
                rotate: [0, 45, -45, 0],
                scale: [1, 0.9, 1.1, 1],
                transition: { duration: 0.3 }
              }}
            >
              <Scissors className="h-8 w-8 text-primary mr-2 drop-shadow-lg scissor-sparkle filter" />
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Scissors className="h-8 w-8 text-primary mr-2 blur-sm" />
              </motion.div>
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold text-primary"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5,
                type: "tween",
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.02,
                color: "var(--color-primary)",
                textShadow: "0 0 8px rgba(0,0,0,0.3)"
              }}
            >
              Barbear.IA
            </motion.h1>
          </motion.div>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Sistema SaaS para Barbearias
          </motion.p>
        </motion.div>

        <MaterialCard
          elevation={2}
          interactive={false}
          animation="scaleIn"
          hoverElevation={3}
        >
          <MaterialCardHeader className="text-center pb-4">
            <motion.div
              className="mx-auto mb-4 w-20 h-20 rounded-full overflow-hidden elevation-2 hover-lift"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: 0, 
                opacity: 1,
                y: [0, -5, 0]
              }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                type: "tween",
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.1, 
                rotate: [0, -5, 5, 0],
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-full h-full relative overflow-hidden"
                animate={{
                  scale: [1, 1.02, 1, 1.01, 1],
                  rotate: [0, 0.5, -0.5, 0.3, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{
                  scale: [1, 1.08, 1.05],
                  rotate: [0, 1, -1, 0],
                  transition: { duration: 1.5 }
                }}
                whileTap={{
                  scale: [1, 0.95, 1.03, 1],
                  transition: { duration: 0.4 }
                }}
              >
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg overflow-hidden">
                  <svg 
                    width="200" 
                    height="200" 
                    viewBox="0 0 200 200" 
                    className="barbershop-image-animated"
                  >
                    {/* Background */}
                    <rect width="200" height="200" fill="url(#bgGradient)" />
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="poleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#dc2626" />
                        <stop offset="33%" stopColor="#ffffff" />
                        <stop offset="66%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                    
                    {/* Barber Pole */}
                    <g transform="translate(85, 30)">
                      <rect x="0" y="0" width="30" height="140" fill="url(#poleGradient)" rx="15" />
                      <circle cx="15" cy="-5" r="8" fill="#4a5568" />
                      <circle cx="15" cy="145" r="8" fill="#4a5568" />
                    </g>
                    
                    {/* Scissors */}
                    <g transform="translate(50, 80)">
                      <path d="M10 10 L25 25 M25 10 L10 25" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="10" cy="10" r="4" fill="#e2e8f0" />
                      <circle cx="25" cy="25" r="4" fill="#e2e8f0" />
                    </g>
                    
                    {/* Razor */}
                    <g transform="translate(120, 80)">
                      <rect x="0" y="0" width="20" height="30" fill="#6b7280" rx="3" />
                      <rect x="2" y="2" width="16" height="26" fill="#e5e7eb" rx="2" />
                      <rect x="6" y="32" width="8" height="4" fill="#4b5563" />
                    </g>
                    
                    {/* Mustache */}
                    <g transform="translate(70, 120)">
                      <path d="M0 10 Q15 0 30 10 Q45 0 60 10 Q45 20 30 10 Q15 20 0 10" fill="#374151" />
                    </g>
                    
                    {/* Text */}
                    <text x="100" y="180" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontFamily="serif" fontWeight="bold">
                      Barbearia Clássica
                    </text>
                  </svg>
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
                  animate={{
                    x: [-100, 300],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    repeatDelay: 5
                  }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-primary/20 rounded-full opacity-0"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>
          </MaterialCardHeader>

          <MaterialCardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <TabsList className="grid w-full grid-cols-2 elevation-1">
                  <TabsTrigger
                    value="login"
                    className="transition-material hover:elevation-1"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="transition-material hover:elevation-1"
                  >
                    Cadastrar
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              <TabsContent
                value="login"
                className="space-y-4 mt-6"
              >
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <MaterialCardTitle>
                    Escolha o seu tipo de Usuário
                  </MaterialCardTitle>
                  <MaterialCardDescription>
                    Selecione abaixo e faça login
                  </MaterialCardDescription>
                </motion.div>

                {/* User Type Selection for Login - Horizontal Layout */}
                <motion.div
                  className="flex gap-2 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {/* Cliente */}
                  <MaterialButton
                    type="button"
                    variant={
                      loginData.userType === "client"
                        ? "raised"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setLoginData({
                        ...loginData,
                        userType: "client",
                      })
                    }
                    className="flex-1 flex flex-col h-auto py-3 px-2 user-type-button"
                    data-selected={loginData.userType === "client"}
                    animation="bounce"
                  >
                    <AnimatedIcon
                      icon={Users}
                      animation="wiggle"
                      category="user"
                      size="sm"
                      intensity="medium"
                      delay={100}
                      className="mb-1"
                    />
                    <span className="text-xs">Cliente</span>
                  </MaterialButton>

                  {/* Barbeiro */}
                  <MaterialButton
                    type="button"
                    variant={
                      loginData.userType === "barber"
                        ? "raised"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setLoginData({
                        ...loginData,
                        userType: "barber",
                      })
                    }
                    className="flex-1 flex flex-col h-auto py-3 px-2 user-type-button"
                    data-selected={loginData.userType === "barber"}
                    animation="bounce"
                  >
                    <AnimatedIcon
                      icon={UserCheck}
                      animation="pulse"
                      category="user"
                      size="sm"
                      intensity="medium"
                      delay={200}
                      className="mb-1"
                    />
                    <span className="text-xs">Barbeiro</span>
                  </MaterialButton>

                  {/* Barbearia */}
                  <MaterialButton
                    type="button"
                    variant={
                      loginData.userType === "barbershop"
                        ? "raised"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setLoginData({
                        ...loginData,
                        userType: "barbershop",
                      })
                    }
                    className="flex-1 flex flex-col h-auto py-3 px-2 user-type-button"
                    data-selected={loginData.userType === "barbershop"}
                    animation="bounce"
                  >
                    <motion.div
                      className="relative"
                      animate={{ 
                        rotate: [0, 8, -8, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        delay: 0.3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Scissors className="h-4 w-4 mb-1 transition-colors" />
                    </motion.div>
                    <span className="text-xs">Barbearia</span>
                  </MaterialButton>

                  {/* Barbear.AI */}
                  <MaterialButton
                    type="button"
                    variant={
                      loginData.userType === "super_admin"
                        ? "raised"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setLoginData({
                        ...loginData,
                        userType: "super_admin",
                      })
                    }
                    className="flex-1 flex flex-col h-auto py-3 px-2 user-type-button"
                    data-selected={loginData.userType === "super_admin"}
                    animation="bounce"
                  >
                    <AnimatedIcon
                      icon={Shield}
                      animation="glow"
                      category="admin"
                      size="sm"
                      intensity="high"
                      delay={400}
                      className="mb-1"
                    />
                    <span className="text-xs">Barbear.IA</span>
                  </MaterialButton>
                </motion.div>

                <motion.form
                  onSubmit={handleLogin}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <motion.div
                    className="flex items-center gap-2 sm:gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label htmlFor="email" className="min-w-[50px] sm:min-w-[60px] text-sm">Email:</Label>
                    <div className="relative flex-1">
                      <Input
                        ref={loginEmailRef}
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            email: e.target.value,
                          })
                        }
                        required
                        disabled={!loginData.userType}
                        placeholder={!loginData.userType ? "Selecione o tipo de usuário" : ""}
                        className="transition-material hover:elevation-1 focus:elevation-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      />
                      {showLoginTypewriter && !loginData.email && (
                        <motion.div
                          className="absolute inset-0 flex items-center px-3 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <span className="text-primary typewriter-text text-sm">
                            {loginTypewriterText}
                            <span className="typewriter-cursor">|</span>
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-2 sm:gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label htmlFor="password" className="min-w-[50px] sm:min-w-[60px] text-sm">Senha:</Label>
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                        disabled={!loginData.userType}
                        placeholder={loginData.userType ? "Sua senha" : "Selecione o tipo de usuário"}
                        className="transition-material hover:elevation-1 focus:elevation-2 w-full pr-12 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      />
                      <button
                        type="button"
                        disabled={!loginData.userType}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {error && (
                    <motion.div
                      className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md border border-destructive/20"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <MaterialButton
                      type="submit"
                      variant="raised"
                      className="w-full"
                      disabled={isLoading || !loginData.userType}
                      loading={isLoading}
                      animation={isLoading ? "pulse" : "none"}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </MaterialButton>
                  </motion.div>
                </motion.form>

              </TabsContent>

              <TabsContent
                value="register"
                className="space-y-4 mt-6"
              >
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <MaterialCardTitle>
                    Criar nova conta
                  </MaterialCardTitle>
                  <MaterialCardDescription>
                    Selecione o tipo e preencha os dados
                  </MaterialCardDescription>
                </motion.div>

                {/* User Type Selection for Register - Horizontal Layout */}
                <motion.div
                  className="flex gap-2 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  {/* Cliente */}
                  <MaterialButton
                    type="button"
                    variant={
                      registerData.userType === "client"
                        ? "raised"
                        : "outline"
                    }
                    onClick={() => {
                      setRegisterData({
                        ...registerData,
                        userType: "client",
                      });
                      setRegisterData({
                        ...registerData,
                        userType: "client",
                      });
                    }}
                    className="flex-1 flex flex-col h-auto py-3 px-2 user-type-button"
                    data-selected={registerData.userType === "client"}
                    animation="bounce"
                  >
                    <AnimatedIcon
                      icon={Users}
                      animation="wiggle"
                      category="user"
                      size="sm"
                      intensity="medium"
                      delay={100}
                      className="mb-1"
                    />
                    <span className="text-xs">Cliente</span>
                  </MaterialButton>

                  {/* Barbeiro */}
                  <MaterialButton
                    type="button"
                    variant={
                      registerData.userType === "barber"




                        ? "raised"
                        : "outline"
                    }
                    onClick={() => {
                      setRegisterData({
                        ...registerData,
                        userType: "barber",
                      });
                    }}
                    className="flex-1 flex flex-col h-auto py-3 px-2 user-type-button"
                    data-selected={registerData.userType === "barber"}
                    animation="bounce"
                  >
                    <AnimatedIcon
                      icon={UserCheck}
                      animation="pulse"
                      category="user"
                      size="sm"
                      intensity="medium"
                      delay={200}
                      className="mb-1"
                    />
                    <span className="text-xs">Barbeiro</span>
                  </MaterialButton>

                  {/* Barbearia */}
                  <MaterialButton
                    type="button"
                    variant={
                      registerData.userType === "barbershop"
                        ? "raised"
                        : "outline"
                    }
                    onClick={() => {
                      setRegisterData({
                        ...registerData,
                        userType: "barbershop",
                      });
                    }}
                    className="flex-1 flex flex-col h-auto py-3 px-2 user-type-button"
                    data-selected={registerData.userType === "barbershop"}
                    animation="bounce"
                  >
                    <motion.div
                      className="relative"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.08, 1]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        delay: 0.3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Scissors className="h-4 w-4 mb-1 transition-all duration-300" />
                    </motion.div>
                    <span className="text-xs">Barbearia</span>
                  </MaterialButton>

                  {/* Barbear.AI - Disabled for registration */}
                  <MaterialButton
                    type="button"
                    variant="outline"
                    disabled
                    className="flex-1 flex flex-col h-auto py-3 px-2 opacity-30 cursor-not-allowed"
                  >
                    <Shield className="h-4 w-4 mb-1" />
                    <span className="text-xs">Barbear.AI</span>
                  </MaterialButton>
                </motion.div>

                <motion.form
                  onSubmit={handleRegister}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <motion.div
                    className="flex items-center gap-2 sm:gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Label htmlFor="name" className="min-w-[70px] sm:min-w-[80px] text-sm shrink-0">
                      {registerData.userType === "barbershop"
                        ? "Responsável:"
                        : registerData.userType === "barber"
                        ? "Barbeiro:"
                        : "Nome:"}
                    </Label>
                    <div className="relative flex-1">
                      <Input
                        ref={registerNameRef}
                        id="name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            name: e.target.value,
                          })
                        }
                        required
                        disabled={!registerData.userType}
                        placeholder={!registerData.userType ? "Selecione o tipo de usuário" : ""}
                        className="transition-material hover:elevation-1 focus:elevation-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      />
                      {showRegisterTypewriter && !registerData.name && (
                        <motion.div
                          className="absolute inset-0 flex items-center px-3 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <span className="text-primary typewriter-text text-sm">
                            {registerTypewriterText}
                            <span className="typewriter-cursor">|</span>
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {registerData.userType === "barbershop" && (
                    <motion.div
                      className="flex items-center gap-2 sm:gap-3"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.45 }}
                    >
                      <Label htmlFor="businessName" className="min-w-[70px] sm:min-w-[80px] text-sm shrink-0">
                        Barbearia:
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={registerData.businessName || ""}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            businessName: e.target.value,
                          })
                        }
                        required
                        placeholder="Nome da sua barbearia"
                        className="flex-1 transition-material hover:elevation-1 focus:elevation-2 text-sm"
                      />
                    </motion.div>
                  )}

                  <motion.div
                    className="flex items-center gap-2 sm:gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label htmlFor="registerEmail" className="min-w-[70px] sm:min-w-[80px] text-sm shrink-0">Email:</Label>
                    <div className="relative flex-1">
                      <Input
                        id="registerEmail"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => handleEmailChange(e.target.value, false)}
                        required
                        disabled={!registerData.userType}
                        placeholder={registerData.userType ? "seu@email.com" : "Selecione o tipo de usuário"}
                        className={`flex-1 transition-material hover:elevation-1 focus:elevation-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                          emailValid === false ? 'border-red-500 focus:border-red-500' : 
                          emailValid === true ? 'border-green-500 focus:border-green-500' : ''
                        }`}
                      />
                      {emailValid === true && registerData.email && (
                        <motion.div
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-2 sm:gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.55 }}
                  >
                    <Label htmlFor="phone" className="min-w-[70px] sm:min-w-[80px] text-sm shrink-0">Telefone:</Label>
                    <div className="relative flex-1">
                      <Input
                        id="phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        required
                        disabled={!registerData.userType}
                        placeholder={registerData.userType ? "(11) 99999-9999" : "Selecione o tipo de usuário"}
                        className={`flex-1 transition-material hover:elevation-1 focus:elevation-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                          phoneValid === false ? 'border-red-500 focus:border-red-500' : 
                          phoneValid === true ? 'border-green-500 focus:border-green-500' : ''
                        }`}
                      />
                      {phoneValid === true && registerData.phone && (
                        <motion.div
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {registerData.userType === "barbershop" && (
                    <motion.div
                      className="flex items-center gap-2 sm:gap-3"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <Label htmlFor="address" className="min-w-[70px] sm:min-w-[80px] text-sm shrink-0">Endereço:</Label>
                      <Input
                        id="address"
                        type="text"
                        value={registerData.address || ""}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            address: e.target.value,
                          })
                        }
                        required
                        placeholder="Endereço completo"
                        className="flex-1 transition-material hover:elevation-1 focus:elevation-2 text-sm"
                      />
                    </motion.div>
                  )}

                  {registerData.userType === "client" && (
                    <motion.div
                      className="flex items-center gap-2 sm:gap-3"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                    >
                      <Label htmlFor="preferredLocation" className="min-w-[70px] sm:min-w-[80px] text-sm shrink-0">
                        Região:
                      </Label>
                      <Input
                        id="preferredLocation"
                        type="text"
                        value={
                          registerData.preferredLocation || ""
                        }
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            preferredLocation: e.target.value,
                          })
                        }
                        placeholder="Ex: Centro (opcional)"
                        className="flex-1 transition-material hover:elevation-1 focus:elevation-2 text-sm"
                      />
                    </motion.div>
                  )}

                  <motion.div
                    className="flex items-center gap-2 sm:gap-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.65 }}
                  >
                    <Label htmlFor="registerPassword" className="min-w-[70px] sm:min-w-[80px] text-sm shrink-0">
                      Senha:
                    </Label>
                    <div className="relative flex-1">
                      <Input
                        id="registerPassword"
                        type={
                          showPassword ? "text" : "password"
                        }
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                        required
                        disabled={!registerData.userType}
                        placeholder={registerData.userType ? "Mínimo 6 caracteres" : "Selecione o tipo de usuário"}
                        className="transition-material hover:elevation-1 focus:elevation-2 w-full pr-12 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      />
                      <button
                        type="button"
                        disabled={!registerData.userType}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {error && (
                    <motion.div
                      className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md border border-destructive/20"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <MaterialButton
                      type="submit"
                      variant="raised"
                      className="w-full"
                      disabled={isLoading || !registerData.userType}
                      loading={isLoading}
                      animation={isLoading ? "pulse" : "none"}
                    >
                      {isLoading ? "Criando conta..." : "Criar conta"}
                    </MaterialButton>
                  </motion.div>
                </motion.form>
              </TabsContent>
            </Tabs>
          </MaterialCardContent>
        </MaterialCard>
      </motion.div>
    </motion.div>
  );
}
