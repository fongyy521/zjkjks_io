const firebaseConfig = {
    apiKey: "AIzaSyCJlqL4VA17aCr9wfKEP3fxAK5IGW_GoGE",
    authDomain: "accounting-checkin.firebaseapp.com",
    projectId: "accounting-checkin",
    storageBucket: "accounting-checkin.firebasestorage.app",
    messagingSenderId: "741311754434",
    appId: "1:741311754434:web:7396164852387302018b5b"
};

// 检查 Firebase 对象是否存在
if (typeof firebase !== 'undefined') {
    try {
        // 初始化 Firebase
        const app = firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // 导出必要的对象
        window.auth = auth;
        window.db = db;
        window.firebase = firebase;
        
        console.log('Firebase 初始化成功');
    } catch (error) {
        console.error('Firebase 初始化失败:', error);
    }
} else {
    console.error('Firebase SDK 未加载');
}
