
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth, useTheme, useToast } from '../App';
import { Role, User, Subject, Task, Submission, Message, ForumPost, PrivateMessage } from '../types';
import { dataService } from '../services/dataService';

type View = 'home' | 'subjects' | 'tasks' | 'messages' | 'forum' | 'profile' | 'ranking' | 'schedule' | 'manage_subjects' | 'stats';


const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [view, setView] = useState<View>('home');

    if (!user) {
        logout();
        return null;
    }

    const renderView = () => {
        switch (view) {
            case 'home': return <HomeView user={user} />;
            case 'subjects': return <SubjectsView user={user} />;
            case 'tasks': return <TasksView user={user} />;
            case 'messages': return <MessagesView user={user} />;
            case 'forum': return <ForumView user={user} />;
            case 'profile': return <ProfileView user={user} />;
            default: return <HomeView user={user} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar user={user} activeView={view} setView={setView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar user={user} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

// --- LAYOUT COMPONENTS ---
const Sidebar: React.FC<{ user: User, activeView: View, setView: (view: View) => void }> = ({ user, activeView, setView }) => {
    const navItems = useMemo(() => {
        const base = [
            { name: 'Inicio', icon: 'fas fa-home', view: 'home' as View },
            { name: 'Materias', icon: 'fas fa-book', view: 'subjects' as View },
            { name: 'Tareas', icon: 'fas fa-clipboard-list', view: 'tasks' as View },
            { name: 'Mensajes', icon: 'fas fa-envelope', view: 'messages' as View },
            { name: 'Foro', icon: 'fas fa-comments', view: 'forum' as View },
            { name: 'Perfil', icon: 'fas fa-user-circle', view: 'profile' as View },
        ];
        if (user.role === Role.Director) {
            return base; // Director can see everything
        }
        if (user.role === Role.Teacher) {
            return base;
        }
        return base; // Student
    }, [user.role]);

    return (
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
                <i className="fas fa-school text-3xl text-brand-blue dark:text-white"></i>
                <h1 className="text-2xl font-bold ml-3 text-brand-blue dark:text-white">INMODOSA</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
                <nav className="mt-5">
                    {navItems.map(item => (
                        <a
                            key={item.name}
                            className={`flex items-center mt-4 py-2 px-6 cursor-pointer transition-colors ${activeView === item.view ? 'bg-brand-blue text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            onClick={() => setView(item.view)}
                        >
                            <i className={`${item.icon} w-6`}></i>
                            <span className="mx-3">{item.name}</span>
                        </a>
                    ))}
                </nav>
            </div>
        </div>
    );
};

const Topbar: React.FC<{ user: User }> = ({ user }) => {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center">
                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Bienvenido, {user.name}</h2>
                 <span className="ml-3 px-2 py-1 text-xs text-white bg-brand-blue rounded-full">{user.role}</span>
            </div>
            <div className="flex items-center space-x-4">
                 <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
                     {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
                 </button>
                <button onClick={logout} className="flex items-center text-red-500 hover:text-red-700">
                    <i className="fas fa-sign-out-alt w-6"></i>
                    <span className="mx-2 hidden sm:block">Cerrar Sesión</span>
                </button>
            </div>
        </header>
    );
};

// --- VIEW COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        {children}
    </div>
);

const HomeView: React.FC<{user: User}> = ({ user }) => {
    const data = dataService.getDataForUser(user);

    const getAverageGrade = () => {
        if (user.role !== Role.Student) return 0;
        const studentSubmissions = data.submissions.filter(s => s.studentId === user.id && s.grade);
        if (studentSubmissions.length === 0) return 0;
        const total = studentSubmissions.reduce((acc, sub) => acc + sub.grade!, 0);
        return (total / studentSubmissions.length).toFixed(2);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Panel Principal</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center">
                        <i className="fas fa-clipboard-list text-3xl text-blue-500"></i>
                        <div className="ml-4">
                            <p className="text-gray-500">Tareas Pendientes</p>
                            <p className="text-2xl font-bold">{data.tasks.filter(t => !data.submissions.some(s => s.taskId === t.id)).length}</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center">
                        <i className="fas fa-envelope text-3xl text-green-500"></i>
                        <div className="ml-4">
                            <p className="text-gray-500">Mensajes No Leídos</p>
                            <p className="text-2xl font-bold">{data.messages.length}</p>
                        </div>
                    </div>
                </Card>
                {user.role === Role.Student && (
                    <Card>
                        <div className="flex items-center">
                            <i className="fas fa-star text-3xl text-yellow-500"></i>
                            <div className="ml-4">
                                <p className="text-gray-500">Promedio General</p>
                                <p className="text-2xl font-bold">{getAverageGrade()}</p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
            <div className="mt-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4">Anuncios Recientes</h2>
                    <ul>
                        {data.posts.filter(p => p.subjectId === 'global').slice(0, 3).map(post => (
                            <li key={post.id} className="border-b dark:border-gray-700 py-3 last:border-b-0">
                                <p className="font-semibold text-brand-blue dark:text-blue-300">{post.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{post.content.substring(0, 100)}...</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(post.timestamp).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

const SubjectsView: React.FC<{user: User}> = ({ user }) => {
    const data = dataService.getDataForUser(user);
    return (
         <div>
            <h1 className="text-3xl font-bold mb-6">Materias</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.subjects.map(subject => (
                    <Card key={subject.id}>
                        <h2 className="text-xl font-bold text-brand-blue dark:text-white">{subject.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">Docente: {data.getUserById(subject.teacherId)?.name}</p>
                        <p className="text-sm mt-2">Grados: {subject.grades.join(', ')}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}

const TasksView: React.FC<{user: User}> = ({ user }) => {
    const { addToast } = useToast();
    const [refresh, setRefresh] = useState(0);
    const data = useMemo(() => dataService.getDataForUser(user), [user, refresh]);

    const handleSimulatedUpload = (taskId: string) => {
        dataService.submitTask({ taskId, studentId: user.id, file: { name: 'simulated_file.pdf' } });
        addToast('Tarea entregada exitosamente ✅', 'success');
        setRefresh(r => r + 1);
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Tareas</h1>
            <Card>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.tasks.map(task => {
                    const submission = data.submissions.find(s => s.taskId === task.id);
                    const subject = data.getSubjectById(task.subjectId);
                    return (
                        <div key={task.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h3 className="text-lg font-semibold">{task.title} - <span className="text-brand-blue dark:text-blue-300">{subject?.name}</span></h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                                <p className="text-sm text-gray-500 mt-2">Fecha de entrega: {new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center space-x-4">
                                {submission ? (
                                    <div className="text-center">
                                       <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">Entregada</span>
                                       {submission.grade && <p className="text-lg font-bold mt-2">Calificación: {submission.grade}/5</p>}
                                    </div>
                                ) : (
                                    user.role === Role.Student &&
                                    <button onClick={() => handleSimulatedUpload(task.id)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                        Entregar Tarea
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                </div>
            </Card>
        </div>
    );
};

const MessagesView: React.FC<{ user: User }> = ({ user }) => {
    const { addToast } = useToast();
    const [refresh, setRefresh] = useState(0);
    const data = useMemo(() => dataService.getDataForUser(user), [user, refresh]);

    type ConversationItem = {
        id: string; // user id or group id like 'global'
        type: 'private' | 'group';
        name: string;
        lastMessage: string;
        timestamp: string;
        avatarLetter: string;
        icon?: string;
    };

    const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversationList = useMemo<ConversationItem[]>(() => {
        const list: ConversationItem[] = [];

        // Private Conversations
        data.conversations.forEach(convo => {
            const otherParticipantId = convo.participantIds.find(pId => pId !== user.id);
            if (otherParticipantId) {
                const otherUser = data.getUserById(otherParticipantId);
                const lastMsg = data.privateMessages
                    .filter(pm => pm.conversationId === convo.id)
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                if (otherUser) {
                    list.push({
                        id: otherUser.id,
                        type: 'private',
                        name: otherUser.name,
                        lastMessage: lastMsg?.content ?? 'Inicia la conversación',
                        timestamp: lastMsg?.timestamp ?? convo.updatedAt,
                        avatarLetter: otherUser.name.charAt(0)
                    });
                }
            }
        });
        
        // Group Conversations (Simulated)
        const globalMessages = data.messages.filter(m => m.audience === 'global');
        if (globalMessages.length > 0) {
            const lastMsg = globalMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            list.push({
                id: 'global',
                type: 'group',
                name: 'Anuncios Globales',
                lastMessage: lastMsg.content,
                timestamp: lastMsg.timestamp,
                avatarLetter: 'A',
                icon: 'fas fa-bullhorn'
            });
        }

        return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [data, user.id]);

    const activeMessages = useMemo(() => {
        if (!selectedConversation) return [];
        if (selectedConversation.type === 'private') {
            const convo = data.conversations.find(c => c.participantIds.includes(selectedConversation.id));
            if (!convo) return [];
            return data.privateMessages
                .filter(pm => pm.conversationId === convo.id)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
        if (selectedConversation.type === 'group') {
             return data.messages
                .filter(m => m.audience === selectedConversation.id)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
        return [];
    }, [data, selectedConversation]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || selectedConversation.type !== 'private') return;
        
        dataService.sendPrivateMessage(user.id, selectedConversation.id, newMessage.trim());
        setNewMessage('');
        addToast('Mensaje enviado 📩', 'success');
        setRefresh(r => r + 1);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Mensajes</h1>
            <Card className="p-0">
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg" style={{ height: 'calc(100vh - 250px)'}}>
                    <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                        <h2 className="p-4 font-bold text-lg border-b dark:border-gray-700">Conversaciones</h2>
                        <ul>
                            {conversationList.map(convo => (
                                <li key={`${convo.type}-${convo.id}`} onClick={() => setSelectedConversation(convo)}
                                    className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 ${selectedConversation?.id === convo.id ? 'bg-blue-100 dark:bg-blue-900' : ''}`}>
                                    <div className="w-12 h-12 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xl">
                                        {convo.icon ? <i className={convo.icon}></i> : convo.avatarLetter}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold truncate">{convo.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{convo.lastMessage}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-2/3 flex flex-col">
                       {selectedConversation ? (
                            <>
                             <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {activeMessages.map(msg => (
                                    <div key={msg.id} className={`flex ${('senderId' in msg ? msg.senderId : msg.authorId) === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${('senderId' in msg ? msg.senderId : msg.authorId) === user.id ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                            {'authorId' in msg && <p className="font-bold text-sm mb-1">{data.getUserById(msg.authorId)?.name}</p>}
                                             <p>{msg.content}</p>
                                             <p className={`text-xs mt-1 text-right ${('senderId' in msg ? msg.senderId : msg.authorId) === user.id ? 'text-blue-200' : 'text-gray-500'}`}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                         </div>
                                     </div>
                                 ))}
                                  <div ref={messagesEndRef} />
                             </div>
                             {selectedConversation.type === 'private' && (
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                                     <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..."
                                         className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                                     <button type="submit" className="px-4 py-2 text-white bg-brand-blue rounded-full hover:bg-brand-blue-dark focus:outline-none">
                                         Enviar
                                     </button>
                                 </form>
                             )}
                            </>
                       ) : (
                           <div className="flex-1 flex items-center justify-center text-gray-500">
                               <div className="text-center">
                                  <i className="fas fa-comments text-5xl mb-4"></i>
                                  <p>Selecciona una conversación para ver los mensajes.</p>
                               </div>
                           </div>
                       )}
                    </div>
                </div>
            </Card>
        </div>
    );
};


const ForumView: React.FC<{user: User}> = ({ user }) => {
    const { addToast } = useToast();
    const [refresh, setRefresh] = useState(0);
    const data = useMemo(() => dataService.getDataForUser(user), [user, refresh]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('global');
    
    const handlePublish = () => {
        if (!newPostTitle.trim() || !newPostContent.trim()) {
            addToast('El título y el contenido no pueden estar vacíos.', 'error');
            return;
        }

        dataService.createPost({
            authorId: user.id,
            title: newPostTitle,
            content: newPostContent,
            subjectId: selectedSubjectId,
        });

        addToast('Publicación creada exitosamente ✅', 'success');
        setRefresh(r => r + 1);
        setIsModalOpen(false);
        setNewPostTitle('');
        setNewPostContent('');
        setSelectedSubjectId('global');
    };

    const canPost = user.role === Role.Director || user.role === Role.Teacher;
    const subjectsForSelect = data.subjects;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Foro</h1>
                {canPost && (
                     <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center">
                        <i className="fas fa-plus mr-2"></i>Crear Publicación
                    </button>
                )}
            </div>
            
            <div className="space-y-6">
                {data.posts.map(post => (
                    <Card key={post.id}>
                        <h2 className="text-xl font-bold">{post.title}</h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 my-2">
                           <span>Por: {data.getUserById(post.authorId)?.name}</span>
                           <span>|</span>
                           <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                           <span>|</span>
                           <span className="font-semibold">{post.subjectId === 'global' ? 'General' : data.getSubjectById(post.subjectId)?.name}</span>
                        </div>
                        <p className="mt-4">{post.content}</p>
                    </Card>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4">Nueva Publicación en el Foro</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                                <input type="text" id="postTitle" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div>
                                <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenido</label>
                                <textarea id="postContent" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} rows={5}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue"></textarea>
                            </div>
                             <div>
                                <label htmlFor="postSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Materia / Categoría</label>
                                <select id="postSubject" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue">
                                    <option value="global">General</option>
                                    {subjectsForSelect.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                                Cancelar
                            </button>
                             <button onClick={handlePublish} className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark">
                                Publicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProfileView: React.FC<{user: User}> = ({ user }) => {
    const { addToast } = useToast();
    
    const handleDownloadCertificate = () => {
        addToast('Certificado de matrícula generado (simulado)', 'success');
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Perfil</h1>
            <Card>
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 rounded-full bg-brand-blue flex items-center justify-center">
                        <span className="text-4xl text-white">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{user.role}</p>
                        {user.role === Role.Student && <p className="text-gray-600 dark:text-gray-400">{user.grade}° Grado</p>}
                    </div>
                </div>
                 {user.role === Role.Student && (
                    <div className="mt-8 border-t dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold">Estadísticas del Alumno</h3>
                        <div className="mt-4">
                            <p>Asistencia: <span className="font-bold">{user.attendance}%</span></p>
                        </div>
                    </div>
                 )}
            </Card>
            
            {user.role === Role.Student && user.enrollmentStatus && (
                <Card>
                    <h3 className="text-xl font-bold mb-4">Estado de Matrícula</h3>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        <p><strong>Estado:</strong> <span className="px-2 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">{user.enrollmentStatus.status}</span></p>
                        <p><strong>Fecha de Matrícula:</strong> {new Date(user.enrollmentStatus.enrollmentDate).toLocaleDateString()}</p>
                        <p><strong>Grado Matriculado:</strong> {user.grade}° Grado</p>
                    </div>
                    <div className="mt-6">
                        <button 
                            onClick={handleDownloadCertificate}
                            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center">
                            <i className="fas fa-download mr-2"></i>Descargar Certificado (Simulado)
                        </button>
                    </div>
                </Card>
            )}

            <Card>
                <h3 className="text-xl font-bold mb-4">Información de la Institución</h3>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                     <p className="flex items-center"><i className="fas fa-map-marker-alt w-6 text-brand-blue"></i>Orihueca, Magdalena, Colombia</p>
                     <p className="flex items-center"><i className="fas fa-envelope w-6 text-brand-blue"></i>INMODOSA@GMAIL.COM</p>
                     <p className="flex items-center"><i className="fab fa-whatsapp w-6 text-brand-blue"></i>+57 321 814 0296</p>
                </div>
            </Card>

        </div>
    );
};

export default Dashboard;