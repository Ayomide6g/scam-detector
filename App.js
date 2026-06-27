import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Image, Modal, StatusBar } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { Linking, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { supabase } from './supabase';
//My signup screen
function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false); 

  const handleAuth = async () => {
    setErrorMsg('');
    
    if (!email || !password || (!isLogin && !name)) {
      setErrorMsg('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email or password is incorrect. Try again or Sign Up.');
          }
          throw error;
        }

      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            throw new Error('Account already exists. Please Login instead.');
          }
          throw error;
        }

        if (data.user) {
          await supabase.from('profile').insert({
            id: data.user.id,
            name: name,
            avatar_url: null,
            plan: 'free',
            checks_used: 0
          });
        }
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={authStyles.content}>
        <View style={authStyles.header}>
          <Image 
            source={require('./assets/logo.png')} 
            style={authStyles.logo} 
          />
          <Text style={authStyles.title}>Scam Detector</Text>
          <Text style={authStyles.subtitle}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </Text>
        </View>

        <View style={authStyles.form}>
          {!isLogin && (
            <View style={authStyles.inputBox}>
              <MaterialIcons name="person" size={20} color="#6B7280" />
              <TextInput
                style={authStyles.input}
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={authStyles.inputBox}>
            <MaterialIcons name="email" size={20} color="#6B7280" />
            <TextInput
              style={authStyles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMsg('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={authStyles.inputBox}>
            <MaterialIcons name="lock" size={20} color="#6B7280" />
            <TextInput
              style={[authStyles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMsg('');
              }}
              secureTextEntry={!showPassword} // TOGGLE THIS
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={authStyles.errorBox}>
              <MaterialIcons name="error-outline" size={16} color="#EF4444" />
              <Text style={authStyles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[authStyles.button, loading && { opacity: 0.7 }]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={authStyles.buttonText}>
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={authStyles.toggle}
            onPress={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setPassword('');
              setShowPassword(false); // Reset eye icon
            }}
          >
            <Text style={authStyles.toggleText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
              
const authStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: {
  width: 80,
  height: 80,
  borderRadius: 40,
  marginBottom: 16,
},
  title: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  form: { gap: 16 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB', height: 56 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#111827' },
  button: { backgroundColor: '#0D47A1', height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  toggle: { marginTop: 16, alignItems: 'center' },
  toggleText: { color: '#2563EB', fontSize: 14, fontWeight: '500' },
  errorBox: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FEE2E2',
  padding: 12,
  borderRadius: 8,
  marginBottom: 12,
  gap: 8,
},
errorText: {
  color: '#DC2626',
  fontSize: 14,
  flex: 1,
},
}); 
         
// My proifle screen
function ProfileScreen({ setCurrentScreen, setChecksLeft, setShowAdvance, profile, setProfile }) {
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      
    } catch (error) {
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);
    if (error) {
      Alert.alert('Error', 'Failed to log out');
    } else {
      setCurrentScreen('login');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={profileStyles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const plan = profile?.plan || 'free';
  const isPro = plan === 'pro';
  const checksUsed = profile?.checks_used || 0;
  const checksRemaining = isPro ? 'Unlimited' : '3 checks per day';
  const getInitial = (name) => name ? name.trim().charAt(0).toUpperCase() : 'U';
        

  return (
    <SafeAreaView style={profileStyles.container}>
      <View style={profileStyles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={profileStyles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={profileStyles.scrollContent}>           
<View style={profileStyles.userSection}>
  {profile?.avatar_url ? (
    <Image source={{ uri: profile.avatar_url }} style={profileStyles.avatar} />
  ) : (
    <View style={profileStyles.avatar}>
      <Text style={profileStyles.avatarText}>
        {getInitial(profile?.name)}
      </Text>
    </View>
  )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={profileStyles.name}>{profile?.name || 'Scam Detector User'}</Text>
              {isPro && <MaterialIcons name="verified" size={18} color="#3B82F6" style={{ marginLeft: 6 }} />}
            </View>
            <Text style={profileStyles.subtitle}>Manage your account and subscription</Text>
          </View>
        </View>

        <View style={[profileStyles.card, isPro ? profileStyles.proCard : profileStyles.freeCard]}>
          <View style={profileStyles.cardTop}>
            <View>
              <Text style={profileStyles.cardTitle}>
                {isPro ? '₦1,000/month Pro' : 'Free Plan'}
              </Text>
              <View style={[profileStyles.badge, isPro ? profileStyles.proBadge : profileStyles.freeBadge]}>
                <Text style={profileStyles.badgeText}>{isPro ? 'PRO ACTIVE' : 'UPGRADE TO PRO'}</Text>
              </View>
            </View>
            <View style={profileStyles.shieldIcon}>
              <MaterialCommunityIcons 
                name={isPro ? "crown" : "shield-outline"} 
                size={24} 
                color={isPro ? "#F59E0B" : "#6B7280"} 
              />
            </View>
          </View>
          
          {isPro ? (
            <>
              <Text style={profileStyles.renewText}>Renews: Coming soon</Text>
              <View style={profileStyles.perk}><MaterialIcons name="check" size={16} color="#10B981" /><Text style={profileStyles.perkText}>Unlimited Checks</Text></View>
              <View style={profileStyles.perk}><MaterialIcons name="check" size={16} color="#10B981" /><Text style={profileStyles.perkText}>Advanced Detection</Text></View>
              <View style={profileStyles.perk}><MaterialIcons name="check" size={16} color="#10B981" /><Text style={profileStyles.perkText}>Priority Updates</Text></View>
            </>
          ) : (
  <>
    <Text style={profileStyles.renewText}>3 checks per day</Text>
    <TouchableOpacity style={profileStyles.upgradeBtn} onPress={() => setShowAdvance(true)}>
      <Text style={profileStyles.upgradeText}>Get Advance</Text>
    </TouchableOpacity>
  </>
)}
        </View>
        
        {isPro ? (
  <View style={profileStyles.statsRow}>
    <View style={profileStyles.statBox}>
      <Text style={profileStyles.statNumber}>{checksUsed}</Text>
      <Text style={profileStyles.statLabel}>Scam Checks Performed</Text>
    </View>
  </View>
) : (
  <View style={profileStyles.upgradeNudge}>
    <Text style={profileStyles.nudgeTitle}>Unlock Unlimited Checks</Text>
    <Text style={profileStyles.nudgeText}>
      Pro users get unlimited checks, faster results, and priority support
    </Text>
  </View>
)}
       
        <Text style={profileStyles.sectionTitle}>Account Settings</Text>
        <View style={profileStyles.settingsBox}>
          <TouchableOpacity style={profileStyles.settingRow} onPress={() => setCurrentScreen('editProfile')}>
            <Ionicons name="person-outline" size={20} color="#111827" />
            <Text style={profileStyles.settingText}>Edit Profile</Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={profileStyles.rowDivider} />
          <TouchableOpacity style={profileStyles.settingRow} onPress={() => setCurrentScreen('billing')}>
            <Ionicons name="card-outline" size={20} color="#111827" />
            <Text style={profileStyles.settingText}>Subscription & Billing</Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
         </View>
         
        <View style={profileStyles.protectionCard}>
          <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={profileStyles.protectionTitle}>Your protection is our priority</Text>
            <Text style={profileStyles.protectionText}>Advanced AI security monitoring</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={profileStyles.logoutBtn} 
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <Text style={profileStyles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const profileStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  userSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '#0D47A1',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
avatarText: {
  color: '#fff',
  fontSize: 22,
  fontWeight: '700',
},
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12 },
  proCard: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE' },
  freeCard: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6 },
  proBadge: { backgroundColor: '#10B981' },
  freeBadge: { backgroundColor: '#F59E0B' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  shieldIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  renewText: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  perk: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  perkText: { marginLeft: 8, fontSize: 14, color: '#374151' },
  upgradeBtn: { backgroundColor: '#0D47A1', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  upgradeText: { color: '#fff', fontWeight: '600' },
  upgradeNudge: {
  backgroundColor: '#0D47A1',
  borderRadius: 12,
  padding: 16,
  marginTop: 8,
  marginBottom: 16,
  alignItems: 'center',
},
nudgeTitle: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
},
nudgeText: {
  color: '#DBEAFE',
  fontSize: 14,
  textAlign: 'center',
  marginBottom: 0,
  lineHeight: 20,
},
  statsRow: { flexDirection: 'row', marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 8, marginLeft: 4 },
  settingsBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingText: { flex: 1, marginLeft: 12, fontSize: 15, color: '#111827' },
  rowDivider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 48 },
  protectionCard: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 20 },
  protectionTitle: { fontSize: 15, fontWeight: '600', color: '#1E40AF' },
  protectionText: { fontSize: 13, color: '#3B82F6', marginTop: 2 },
  logoutBtn: { backgroundColor: '#EF4444', borderColor: '#FCA5A5', borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});
// ABOUT SCREEN COMPONENT
function AboutScreen({ onBack }) {
  return (
    <SafeAreaView style={aboutStyles.safe}>
      <ScrollView 
  style={aboutStyles.container} 
  contentContainerStyle={{ paddingBottom: 120 }}
  showsVerticalScrollIndicator={false}
>
      
        <View style={aboutStyles.header}>
          <TouchableOpacity onPress={onBack} style={aboutStyles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={aboutStyles.headerTitle}>About</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={aboutStyles.hero}>
          <Text style={aboutStyles.heroTitle}>Helping People Stay{'\n'}Safe Online</Text>
          <Text style={aboutStyles.heroSub}>
            Empowering users with AI-driven protection against{'\n'}digital scams and fraud
          </Text>
        </View>

        <View style={aboutStyles.card}>
          <View style={aboutStyles.cardHeader}>
            <View style={aboutStyles.iconCircle}>
              <MaterialCommunityIcons name="brain" size={24} color="#10B981" />
            </View>
            <Text style={aboutStyles.cardTitle}>What is Scam Detector?</Text>
          </View>
          <Text style={aboutStyles.cardText}>
            Scam Detector is an intelligent AI-powered platform that analyzes text messages, emails, and suspicious content to identify potential scams and fraud attempts. Our advanced machine learning algorithms process thousands of scam patterns to protect you from financial loss and identity theft.
          </Text>
        </View>

        <Text style={aboutStyles.sectionTitle}>How It Works</Text>
        
        <View style={aboutStyles.stepCard}>
          <View style={[aboutStyles.stepIcon, { backgroundColor: '#DBEAFE' }]}>
            <Feather name="clipboard" size={20} color="#2563EB" />
          </View>
          <View style={aboutStyles.stepTextWrap}>
            <Text style={aboutStyles.stepTitle}>1. Paste Your Content</Text>
            <Text style={aboutStyles.stepDesc}>Simply copy and paste any suspicious message, email, or text into our analyzer.</Text>
          </View>
        </View>

        <View style={aboutStyles.stepCard}>
          <View style={[aboutStyles.stepIcon, { backgroundColor: '#D1FAE5' }]}>
            <MaterialIcons name="search" size={20} color="#10B981" />
          </View>
          <View style={aboutStyles.stepTextWrap}>
            <Text style={aboutStyles.stepTitle}>2. AI Analysis</Text>
            <Text style={aboutStyles.stepDesc}>Our advanced AI scans for scam indicators, suspicious patterns, and known fraud techniques.</Text>
          </View>
        </View>

        <View style={aboutStyles.stepCard}>
          <View style={[aboutStyles.stepIcon, { backgroundColor: '#EDE9FE' }]}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#8B5CF6" />
          </View>
          <View style={aboutStyles.stepTextWrap}>
            <Text style={aboutStyles.stepTitle}>3. Instant Detection</Text>
            <Text style={aboutStyles.stepDesc}>Get immediate results with detailed analysis of potential threats and risk factors.</Text>
          </View>
        </View>

        <View style={aboutStyles.stepCard}>
          <View style={[aboutStyles.stepIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
          </View>
          <View style={aboutStyles.stepTextWrap}>
            <Text style={aboutStyles.stepTitle}>4. Detailed Results</Text>
            <Text style={aboutStyles.stepDesc}>Receive comprehensive reports with actionable insights and safety recommendations.</Text>
          </View>
        </View>

        <Text style={aboutStyles.sectionTitle}>Scams We Detect</Text>
        
        <View style={aboutStyles.scamGrid}>
          <View style={aboutStyles.scamCard}>
            <View style={aboutStyles.scamCardInner}>
              <Feather name="alert-triangle" size={24} color="#DC2626" />
              <Text style={aboutStyles.scamTitle}>Suspicious URLs</Text>
              <Text style={aboutStyles.scamDesc}>Phishing links and malicious websites</Text>
            </View>
          </View>
          
          <View style={aboutStyles.scamCard}>
            <View style={aboutStyles.scamCardInner}>
              <MaterialIcons name="card-giftcard" size={24} color="#F59E0B" />
              <Text style={aboutStyles.scamTitle}>Fake Giveaways</Text>
              <Text style={aboutStyles.scamDesc}>Fraudulent prize and Fake giveaway</Text>
            </View>
          </View>
          
          <View style={aboutStyles.scamCard}>
            <View style={aboutStyles.scamCardInner}>
              <MaterialIcons name="trending-up" size={24} color="#10B981" />
              <Text style={aboutStyles.scamTitle}>Investment Scams</Text>
              <Text style={aboutStyles.scamDesc}>Fraudulent Investment Offers</Text>
            </View>
          </View>
          
          <View style={aboutStyles.scamCard}>
            <View style={aboutStyles.scamCardInner}>
              <Ionicons name="person" size={24} color="#8B5CF6" />
              <Text style={aboutStyles.scamTitle}>Impersonation</Text>
              <Text style={aboutStyles.scamDesc}>Fake officials and authority figures</Text>
            </View>
          </View>
        </View>

        <Text style={aboutStyles.sectionTitle}>Understanding Your Results</Text>
        
        <View style={[aboutStyles.resultCard, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
          <View style={aboutStyles.resultHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text style={[aboutStyles.resultTitle, { color: '#065F46' }]}>Safe</Text>
          </View>
          <Text style={[aboutStyles.resultText, { color: '#065F46' }]}>
            No scam indicators detected. The content appears legitimate and safe to engage with.
          </Text>
        </View>

        <View style={[aboutStyles.resultCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
          <View style={aboutStyles.resultHeader}>
            <Feather name="alert-triangle" size={24} color="#F59E0B" />
            <Text style={[aboutStyles.resultTitle, { color: '#92400E' }]}>Suspicious</Text>
          </View>
          <Text style={[aboutStyles.resultText, { color: '#92400E' }]}>
            Some concerning elements found. Exercise caution and verify before taking action.
          </Text>
        </View>

        <View style={[aboutStyles.resultCard, { backgroundColor: '#FEE2E2', borderColor: '#DC2626' }]}>
          <View style={aboutStyles.resultHeader}>
            <MaterialIcons name="dangerous" size={24} color="#DC2626" />
            <Text style={[aboutStyles.resultTitle, { color: '#991B1B' }]}>High Risk</Text>
          </View>
          <Text style={[aboutStyles.resultText, { color: '#991B1B' }]}>
            Multiple scam indicators detected. Do not engage, share information, or send money.
          </Text>
        </View>
              {/* Contact Support Card */}
      <View style={aboutStyles.card}>
        <View style={aboutStyles.cardHeader}>
          <View style={aboutStyles.iconCircle}>
            <MaterialIcons name="email" size={24} color="#1a73e8" />
          </View>
          <Text style={aboutStyles.cardTitle}>Contact Support</Text>
        </View>
        <Text style={aboutStyles.cardText}>
          Need help, have feedback, or want to report a suspicious message, website, or online activity? Contact the Scam Detector support Team:
        </Text>
        <Text 
  style={[aboutStyles.cardText, { fontWeight: '600', marginTop: 8, color: '#1a73e8', textDecorationLine: 'underline' }]}
  onPress={() => {
    Linking.openURL('mailto:scamdetector.support@gmail.com?subject=Scam Detector Support&body=Hi team,').catch(() => {
      Alert.alert('Error', 'Could not open email app');
    });
  }}
>
  scamdetector.support@gmail.com
</Text>
        <Text style={[aboutStyles.cardText, { fontSize: 13, color: '#666', marginTop: 4 }]}>
          We respond within 24 hours
        </Text>
      </View>

        <View style={aboutStyles.disclaimer}>
          <Text style={aboutStyles.disclaimerTitle}>Important Disclaimer</Text>
          <Text style={aboutStyles.disclaimerText}>
            While our AI technology is highly accurate, no detection system is 100% foolproof. Always use your best judgment and verify suspicious content through official channels. Scam Detector is a tool to assist your decision-making, not a replacement for careful verification.
          </Text>
        </View>
              
      </ScrollView>
    </SafeAreaView>
  );
}

const aboutStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#0F172A' },
  hero: { paddingHorizontal: 20, paddingVertical: 32, alignItems: 'center' },
  heroTitle: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#0F172A', 
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12
  },
  heroSub: { 
    fontSize: 16, 
    color: '#64748B', 
    textAlign: 'center',
    lineHeight: 24
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  cardText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#0F172A', 
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8
  },
  stepCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  stepTextWrap: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  scamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 32
  },
  scamCard: {
    width: '50%',
    padding: 6,
  },
  scamCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    alignItems: 'center',
    minHeight: 140
  },
  scamTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginTop: 8, textAlign: 'center' },
  scamDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, lineHeight: 18 },
  resultCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  resultTitle: { fontSize: 18, fontWeight: '700', marginLeft: 8 },
  resultText: { fontSize: 14, lineHeight: 20 },
  disclaimer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  disclaimerTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  disclaimerText: { fontSize: 14, color: '#475569', lineHeight: 22 }
});
// ADVANCE SCREEN COMPONENT
const AdvanceScreen = ({ onBack }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleUpgrade = () => {
    setShowPaymentModal(true);
  };

  return (
  <>
    <SafeAreaView style={advanceStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={advanceStyles.header}>
        <TouchableOpacity onPress={onBack} style={advanceStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={advanceStyles.logoContainer}>
          <Image 
            source={require('./assets/logo.png')} 
            style={advanceStyles.logo}
            resizeMode="contain"
          />
          <Text style={advanceStyles.logoText}>Scam Detector</Text>
        </View>
        <View style={advanceStyles.placeholder} />
      </View>

      <ScrollView style={advanceStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={advanceStyles.content}>
          <Text style={advanceStyles.title}>
  Detect Scams Instantly{'\n'}
  <Text style={advanceStyles.proText}>PRO</Text>
</Text>
<Text style={advanceStyles.subtitle}>Get unlimited protection against scams and fraud</Text>
          <View style={advanceStyles.card}>
            <View style={advanceStyles.proBadge}>
              <MaterialCommunityIcons name="crown" size={18} color="#059669" />
              <Text style={advanceStyles.proLabel}>PRO</Text>
            </View>

            <Text style={advanceStyles.onlyText}>ONLY</Text>
            <Text style={advanceStyles.price}>₦1,000</Text>
            <Text style={advanceStyles.perMonth}>/ month</Text>
            <Text style={advanceStyles.trialText}>7-Day Free Trial.
Then ₦1,000/month</Text>

            <View style={advanceStyles.divider} />

            <View style={advanceStyles.benefitsList}>
              <View style={advanceStyles.benefitRow}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={advanceStyles.benefitText}>Unlimited scam checks</Text>
              </View>
              <View style={advanceStyles.benefitRow}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={advanceStyles.benefitText}>Advanced AI scam analysis</Text>
              </View>
              <View style={advanceStyles.benefitRow}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={advanceStyles.benefitText}>Check links, emails & phone numbers</Text>
              </View>
              <View style={advanceStyles.benefitRow}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={advanceStyles.benefitText}>Faster analysis results</Text>
              </View>
              <View style={advanceStyles.benefitRow}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={advanceStyles.benefitText}>24/7 Priority support</Text>
              </View>
              <View style={advanceStyles.benefitRow}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={advanceStyles.benefitText}>Early access to new features</Text>
              </View>
              </View>

            <TouchableOpacity style={advanceStyles.upgradeButton} onPress={handleUpgrade}>
              <MaterialIcons name="payment" size={20} color="#FFFFFF" />
              <Text style={advanceStyles.upgradeButtonText}>Start 7-Day Free Trial</Text>
            </TouchableOpacity>
            </View>
            <View style={advanceStyles.secureBlock}>
  <View style={advanceStyles.secureRow}>
    <Ionicons name="lock-closed" size={14} color="#64748B" />
    <Text style={advanceStyles.secureText}>Secure payment powered by Paystack</Text>
  </View>
  <Text style={advanceStyles.cancelText}>Cancel anytime. No hidden fees.</Text>
</View>

          <View style={advanceStyles.securityCard}>
            <View style={advanceStyles.shieldIcon}>
              <MaterialCommunityIcons name="shield-check" size={28} color="#3B82F6" />
            </View>
            <View style={advanceStyles.securityContent}>
              <Text style={advanceStyles.securityTitle}>Your security is our priority</Text>
              <Text style={advanceStyles.securityText}>Bank-level encryption protects your data. We never store or share personal information.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
  <Modal visible={showPaymentModal} transparent={true} animationType="fade" onRequestClose={() => setShowPaymentModal(false)}>
  <View style={advanceStyles.modalOverlay}>
    <View style={advanceStyles.modalBox}>
      <Text style={advanceStyles.modalTitle}>Continue to Payment</Text>
      <Text style={advanceStyles.modalMessage}>You will be redirected to Paystack to complete your payment.</Text>
      
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
  <TouchableOpacity 
  style={{ 
    flex: 1, 
    backgroundColor: '#E2E8F0', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: 44
  }} 
  onPress={() => setShowPaymentModal(false)}
>
    <Text style={{ color: '#475569', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={{
  flex: 1,
  backgroundColor: '#0D47A1',
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 44
}}
    onPress={async () => {
      setShowPaymentModal(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return Alert.alert('Error', 'Please login first');
      
      try {
        const res = await fetch('https://scam-detector-backend.vercel.app/api/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, userId: user.id }),
        });
        const data = await res.json();
        if (data.authorization_url) {
          Linking.openURL(data.authorization_url);
        } else {
          Alert.alert('Error', 'Could not start payment');
        }
      } catch (err) {
        Alert.alert('Error', 'Network error');
      }
    }}
  >
    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>OK</Text>
  </TouchableOpacity>
</View>
    </View>
  </View>
</Modal>
</>
  );
};

// ADVANCE SCREEN STYLES
const advanceStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
  backgroundColor: '#FFFFFF',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 12,
  paddingTop: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
  backButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
  },
  logoText: {
  color: '#0F172A',
  fontSize: 18,
  fontWeight: '700',
},
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 44,
  },
  proText: {
    color: '#10B981',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  card: { 
  backgroundColor: '#FFFFFF', 
  borderRadius: 24, 
  padding: 28, 
  width: '100%', 
  alignItems: 'center', 
  shadowColor: '#3B82F6', 
  shadowOffset: { width: 0, height: 8 }, 
  shadowOpacity: 0.25, 
  shadowRadius: 20, 
  elevation: 12, 
  marginBottom: 24, 
  },
  proBadge: { 
  backgroundColor: '#D1FAE5', 
  flexDirection: 'row', 
  alignItems: 'center', 
  paddingHorizontal: 20, 
  paddingVertical: 8, 
  borderRadius: 24, 
  gap: 8, 
  marginBottom: 24, 
}, 
proLabel: { 
  color: '#059669', 
  fontSize: 16, 
  fontWeight: '800', 
  letterSpacing: 1, 
},
  onlyText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  price: {
    fontSize: 56,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 60,
  },
  perMonth: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  trialText: {
  fontSize: 13,
  color: '#64748B',
  marginTop: 4,
  marginBottom: 12,
  textAlign: 'center'
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 24,
  },
  benefitsList: {
    width: '100%',
    gap: 16,
    marginBottom: 28,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#0D47A1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  secureText: {
    fontSize: 13,
    color: '#64748B',
  },
  cancelText: {
    fontSize: 13,
    color: '#64748B',
  },
  securityCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  shieldIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#DBEAFE',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  securityText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
// Privacy and policy screen 
function PrivacyPolicyScreen({ onBack }) {
  const sections = [
    {
      icon: "shield-checkmark-outline",
      title: "1. Our Commitment to Your Privacy",
      text: "Scam Detector is built to protect you from scams without compromising your privacy. We do not store the messages you check. Accounts are only used to manage your daily 3 free scam checks or subscription."
    },
    {
      icon: "close-circle-outline",
      title: "2. Information We DO NOT Collect",
      text: "We do not collect: Your phone number, contacts, location data, or the content of messages you check for scams.\n\nAccounts: If you create an account, we only collect the email, name, and password you provide. Passwords are handled securely by Supabase Auth and are never accessible to us."
    },
    {
      icon: "server-outline",
      title: "3. Information We DO Process",
      text: "Scam Check: When you paste a text or email to check it, it is sent to our servers and/or trusted AI services for AI analysis only. The content is processed in real-time and permanently deleted immediately after we return your results. We do not log, store, or read your messages.\n\nPayments: All payments are handled securely by Paystack. We do not see, store, or process your card details. Paystack's Privacy Policy applies to payment data: paystack.com\n\nApp Diagnostics: We collect anonymous crash reports and performance data through Expo/Supabase to fix bugs. This data cannot identify you and does not include message content.\n\nRate Limiting: We store an anonymous device ID to manage your subscription and your daily check count to enforce the 3-check limit. This data is reset every 24 hours and cannot identify you."
    },
    {
      icon: "analytics-outline",
      title: "4. How We Use Information",
      text: "To detect scams and show you results. To process your Pro Plan payment via Paystack. To maintain and improve Platform stability. We do not sell, rent, or share your data with third parties for marketing."
    },
    {
      icon: "lock-closed-outline",
      title: "5. Data Security",
      text: "We use bank-level encryption to protect data in transit. Because we do not store your messages, there is no message data at rest to be breached."
    },
    {
      icon: "person-outline",
      title: "6. Your Rights",
      text: "Because we minimize data storage, there is little to access, correct, or delete. You can delete your account and all associated data at any time from the Platform, or by contacting us. As a user in Nigeria, you have rights under the Nigeria Data Protection Act 2023. If you have questions, contact us."
    },
    {
      icon: "people-outline",
      title: "7. Children's Privacy",
      text: "Scam Detector is not intended for children under 13. We do not knowingly collect data from children."
    },
    {
      icon: "document-text-outline",
      title: "8. Changes to This Policy",
      text: "We may update this Privacy Policy. We will post the new date at the bottom. Continued use of the app means you accept the changes."
    },
    {
  icon: "mail-outline",
  title: "9. Contact Us", 
  text: "If you have questions about this Privacy Policy, email us at:",
  email: "scamdetector.support@gmail.com"
},
  ];

  return (
    <SafeAreaView style={policyStyles.safe}>
      <View style={policyStyles.headerContainer}>
  <View style={[policyStyles.gradient, { backgroundColor: '#EEF2FF' }]}>
    <View style={policyStyles.headerRow}>
      <TouchableOpacity onPress={onBack} style={policyStyles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#0F172A" />
      </TouchableOpacity>
      <View style={{ width: 24 }} />
    </View>
    
    <Text style={policyStyles.mainTitle}>Privacy Policy</Text>
    <Text style={policyStyles.subtitle}>Your privacy and data protection are important to us</Text>
  </View>
</View>

      <ScrollView 
  style={policyStyles.container} 
  contentContainerStyle={{ paddingBottom: 180}}
  showsVerticalScrollIndicator={false}
>
        <View style={policyStyles.card}>
  {sections.map((section, index) => (
    <View key={index}>
      <View style={policyStyles.sectionRow}>
        <View style={policyStyles.iconWrapper}>
          <Ionicons name={section.icon} size={22} color="#4F46E5" />
        </View>
        <View style={policyStyles.sectionContent}>
          <View style={policyStyles.titleRow}>
            <View style={policyStyles.numberCircle}>
              <Text style={policyStyles.numberText}>{index + 1}</Text>
            </View>
            <Text style={policyStyles.sectionTitle}>{section.title.replace(/^\d+\.\s/, '')}</Text>
          </View>
          <Text style={policyStyles.sectionText}>
  {section.text}
  {section.email && (
    <Text 
      style={{ color: '#1a73e8', textDecorationLine: 'underline', fontWeight: '600' }}
      onPress={() => {
        Linking.openURL(`mailto:${section.email}?subject=Scam Detector Privacy Policy`).catch(() => {
          Alert.alert('Error', 'Could not open email app');
        });
      }}
    >
      {' '}{section.email}
    </Text>
  )}
</Text>
        </View>
      </View>
      {index < sections.length - 1 && <View style={policyStyles.divider} />}
    </View>
  ))}
</View>

        <View style={policyStyles.footer}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={policyStyles.footerText}>By using Scam Detector, you agree to this Privacy Policy.</Text>
        </View>
        <Text style={policyStyles.updated}>Last updated: June 27, 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const policyStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    padding: 4,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 32,
  },
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconWrapper: {
    width: 40,
    alignItems: 'center',
    paddingTop: 2,
  },
  sectionContent: {
    flex: 1,
    paddingLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  sectionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 16,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  updated: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 24,
  },
  linkText: {
  color: '#4F46E5',
  textDecorationLine: 'underline',
  fontWeight: '600',
},
  contactBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  contactEmail: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
//Terms and Condition screen 
function TermsScreen({ onBack }) {
  const openEmail = () => {
    Linking.openURL('mailto:scamdetector.support@gmail.com?subject=Terms and Conditions Inquiry');
  };

  const sections = [
    {
      icon: "document-text-outline",
      title: "Acceptance of Terms",
      text: "By accessing or using Scam Detector (\"the Platform\"), you agree to be bound by these Terms & Conditions. If you do not agree with these terms, please do not use the Platform."
    },
    {
      icon: "platforms-outline", 
      title: "Description of Service",
      text: "Scam Detector provides AI-powered scam detection and analysis tools designed to help users identify potentially fraudulent messages, emails, links, and other content. The Platform provides informational assistance only and does not guarantee the accuracy, completeness, or reliability of any results."
    },
    {
      icon: "warning-outline",
      title: "No Guarantee of Detection", 
      text: "While Scam Detector aims to identify potential scams, no scam detection system is perfect. We do not guarantee that:\n\n1. Every scam will be detected.\n2. Every legitimate message will be classified correctly.\n3. The Platform will prevent financial loss, fraud, or damages.\n\nUsers remain responsible for their own decisions and actions."
    },
    {
      icon: "person-outline",
      title: "User Responsibilities",
      text: "You agree to:\n\n1. Use the Platform only for lawful purposes.\n2. Provide content that you have the right to submit for analysis.\n3. Not attempt to misuse, disrupt, reverse engineer, or interfere with the Platform or its services.\n4. Not use the Platform to engage in illegal, harmful, or fraudulent activities."
    },
    {
      icon: "card-outline",
      title: "Pro Plan Subscription", 
      text: "Scam Detector may offer a paid Pro Plan subscription that provides additional features and benefits. Subscription pricing, billing periods, and available features may change from time to time. By subscribing, you authorize payment processing through our payment provider."
    },
    {
      icon: "cash-outline",
      title: "Payments",
      text: "Payments are securely processed by Paystack. Scam Detector does not store, process, or have access to your payment card information. Payment transactions are subject to Paystack's applicable terms and policies."
    },
    {
      icon: "refresh-outline",
      title: "Refunds",
      text: "Unless otherwise required by applicable law, payments for digital services are generally non-refundable. All refund requests must be made within 7 days of purchase and are subject to Paystack's policies and Nigeria consumer protection laws. If you believe you have been charged incorrectly, contact us at scamdetector.support@gmail.com and we will review your request."
    },
    {
      icon: "shield-checkmark-outline",
      title: "Intellectual Property",
      text: "All content, branding, logos, software, designs, and features of Scam Detector are owned by Scam Detector and protected by applicable intellectual property laws. You may not copy, distribute, modify, or exploit any part of the Platform without prior written permission. You must not reverse engineer, decompile, or attempt to extract the source code of the Platform."
    },
    {
      icon: "cloud-outline",
      title: "Service Availability", 
      text: "We strive to keep the Platform available and functioning properly, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue features at any time without prior notice."
    },
    {
      icon: "alert-circle-outline",
      title: "Limitation of Liability",
      text: "To the maximum extent permitted by law, Scam Detector shall not be liable for:\n\n1. Financial losses\n2. Lost profits\n3. Data loss\n4. Business interruption\n5. Indirect, incidental, special, or consequential damages\n\narising from the use of, or inability to use the Platform. Your use of the Platform is at your own risk."
    },
    {
      icon: "lock-closed-outline",
      title: "Privacy",
      text: "Your use of Scam Detector is also governed by our Privacy Policy."
    },
    {
      icon: "close-circle-outline", 
      title: "Termination",
      text: "We reserve the right to restrict or terminate access to the Platform if we believe a user has violated these Terms & Conditions or abused the service."
    },
    {
      icon: "sync-outline",
      title: "Changes to These Terms",
      text: "We may update these Terms & Conditions from time to time. Updated versions will be posted with a revised \"Last updated\" date. Continued use of the Platform after changes are posted constitutes acceptance of the revised terms."
    },
    {
      icon: "mail-outline",
      title: "Contact Us", 
      text: "If you have questions regarding these Terms & Conditions, please contact:\n\nEmail: scamdetector.support@gmail.com"
    },
  ];

  return (
    <SafeAreaView style={policyStyles.safe}>
      <View style={policyStyles.headerContainer}>
        <View style={[policyStyles.gradient, { backgroundColor: '#EEF2FF' }]}>
          <View style={policyStyles.headerRow}>
            <TouchableOpacity onPress={onBack} style={policyStyles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ width: 24 }} />
          </View>
          <Text style={policyStyles.mainTitle}>Terms & Conditions</Text>
          <Text style={policyStyles.subtitle}>Please read these terms carefully before using Scam Detector</Text>
        </View>
      </View>
      <ScrollView 
  style={policyStyles.container} 
  contentContainerStyle={{ paddingBottom: 180 }} 
  showsVerticalScrollIndicator={false}
>
        <View style={policyStyles.card}>
          {sections.map((section, index) => (
            <View key={index}>
              <View style={policyStyles.sectionRow}>
                <View style={policyStyles.iconWrapper}>
                  <Ionicons name={section.icon} size={22} color="#4F46E5" />
                </View>
                <View style={policyStyles.sectionContent}>
                  <View style={policyStyles.titleRow}>
                    <View style={policyStyles.numberCircle}>
                      <Text style={policyStyles.numberText}>{index + 1}</Text>
                    </View>
                    <Text style={policyStyles.sectionTitle}>{section.title}</Text>
                  </View>
                  <Text style={policyStyles.sectionText}>
                    {section.text.split('scamdetector.support@gmail.com').map((part, i, arr) => 
                      i < arr.length - 1 ? (
                        <Text key={i}>
                          {part}
                          <Text style={policyStyles.linkText} onPress={openEmail}>
                            scamdetector.support@gmail.com
                          </Text>
                        </Text>
                      ) : part
                    )}
                  </Text>
                </View>
              </View>
              {index < sections.length - 1 && <View style={policyStyles.divider} />}
            </View>
          ))}
        </View>
        <View style={policyStyles.footer}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={policyStyles.footerText}>By using Scam Detector, you agree to these Terms & Conditions.</Text>
        </View>
        <Text style={policyStyles.updated}>Last updated: June 27, 2026</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}           
 //Refund Screen        
function RefundPolicyScreen({ onBack }) {
  const openEmail = () => {
    Linking.openURL('mailto:scamdetector.support@gmail.com?subject=Refund Request - Scam Detector Pro');
  };

  const sections = [
    {
      icon: "document-text-outline",
      title: "Overview", 
      text: "Thank you for choosing Scam Detector Pro. Because Scam Detector Pro is a digital subscription service, refunds are handled according to the terms outlined in this Refund Policy."
    },
    {
      icon: "card-outline",
      title: "Subscription Payments",
      text: "Subscription fees are charged in advance for the selected billing period. By purchasing a Pro Plan, you agree to the pricing and billing terms presented at the time of purchase."
    },
    {
      icon: "shield-checkmark-outline", 
      title: "Refund Eligibility",
      text: "Refunds may be considered in the following situations:\n\n1. You were charged multiple times for the same subscription due to a billing error.\n2. You were charged after canceling your subscription.\n3. A technical issue on our side prevented access to Pro features after payment.\n\nTo request a refund, you must contact us at scamdetector.support@gmail.com within 7 days of the charge."
    },
    {
      icon: "close-circle-outline",
      title: "Non-Refundable Situations", 
      text: "Refunds are generally not provided for:\n\n1Change of mind after purchase, except where required by the Federal Competition and Consumer Protection Act 2019 in Nigeria.\n2. Partial use of a subscription period.\n3. Failure to use the service after purchase.\n4. Dissatisfaction with scam analysis results where the service was functioning as intended.\n5. Failure to cancel a subscription before the next billing date."
    },
    {
      icon: "search-outline",
      title: "Refund Review Process",
      text: "All refund requests are reviewed individually. We reserve the right to request additional information necessary to investigate a payment issue before making a refund decision. Approval or denial of refund requests will be determined at our reasonable discretion and in accordance with applicable laws."
    },
    {
      icon: "time-outline",
      title: "Processing of Approved Refunds", 
      text: "If a refund is approved, it will be issued through the original payment method used for the purchase. The time required for funds to appear in your account may vary depending on your bank or payment provider."
    },
    {
      icon: "ban-outline",
      title: "Subscription Cancellation",
      text: "You may cancel your subscription at any time. Cancellation will stop future billing but will not automatically result in a refund for payments already made, except where required by law or approved under this policy."
    },
    {
      icon: "sync-outline",
      title: "Changes to This Policy", 
      text: "We may update this Refund Policy from time to time. Any updates will be posted with a revised \"Last updated\" date."
    },
    {
      icon: "mail-outline",
      title: "Contact Us",
      text: "If you have questions about this Refund Policy or would like to request a refund, please contact:\n\nEmail: scamdetector.support@gmail.com"
    },
  ];

  return (
    <SafeAreaView style={policyStyles.safe}>
      <View style={policyStyles.headerContainer}>
        <View style={[policyStyles.gradient, { backgroundColor: '#EEF2FF' }]}>
          <View style={policyStyles.headerRow}>
            <TouchableOpacity onPress={onBack} style={policyStyles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={{ width: 24 }} />
          </View>
          <Text style={policyStyles.mainTitle}>Refund Policy</Text>
          <Text style={policyStyles.subtitle}>Clear and transparent refund terms for Scam Detector Pro users</Text>
        </View>
      </View>
      <ScrollView 
  style={policyStyles.container} 
  contentContainerStyle={{ paddingBottom: 180 }} 
  showsVerticalScrollIndicator={false}
>
        <View style={policyStyles.card}>
          {sections.map((section, index) => (
            <View key={index}>
              <View style={policyStyles.sectionRow}>
                <View style={policyStyles.iconWrapper}>
                  <Ionicons name={section.icon} size={22} color="#4F46E5" />
                </View>
                <View style={policyStyles.sectionContent}>
                  <View style={policyStyles.titleRow}>
                    <View style={policyStyles.numberCircle}>
                      <Text style={policyStyles.numberText}>{index + 1}</Text>
                    </View>
                    <Text style={policyStyles.sectionTitle}>{section.title}</Text>
                  </View>
                  <Text style={policyStyles.sectionText}>
                    {section.text.split('scamdetector.support@gmail.com').map((part, i, arr) => 
                      i < arr.length - 1 ? (
                        <Text key={i}>
                          {part}
                          <Text style={policyStyles.linkText} onPress={openEmail}>
                            scamdetector.support@gmail.com
                          </Text>
                        </Text>
                      ) : part
                    )}
                  </Text>
                </View>
              </View>
              {index < sections.length - 1 && <View style={policyStyles.divider} />}
            </View>
          ))}
        </View>
        <View style={policyStyles.footer}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={policyStyles.footerText}>Thank you for trusting Scam Detector to keep you safe online.</Text>
        </View>
        <Text style={policyStyles.updated}>Last updated: June 27, 2026</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
//My Edit Profile
function EditProfileScreen({ onBack, profile, setProfile }) {
  const [name, setName] = useState(profile?.name || '');
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [savingName, setSavingName] = useState(false);
const [savingPass, setSavingPass] = useState(false);
const [deleting, setDeleting] = useState(false);
  
  const nameChanged = name.trim() !== profile?.name && name.trim().length > 0;

  const handleSaveName = async () => {
  if (!nameChanged) return;
  if (name.trim().length < 2) {
    return Alert.alert('Error', 'Name must be at least 2 characters');
  }
  
  setSavingName(true);
  const { error } = await supabase
    .from('profile')
    .update({ name: name.trim() })
    .eq('id', profile.id);
  setSavingName(false);

  if (error) {
    Alert.alert('Error', 'Could not update name. Check your connection and try again.');
  } else {
    setProfile({ ...profile, name: name.trim() });
    Alert.alert('Success', 'Name updated successfully');
  }
};

  const handleChangePassword = async () => {
  if (!currentPass) return Alert.alert('Error', 'Enter your current password');
  if (newPass.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
  if (newPass !== confirmPass) return Alert.alert('Error', 'Passwords do not match');
  if (newPass === currentPass) return Alert.alert('Error', 'New password must be different from current password');

  setSavingPass(true);
  
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: currentPass,
  });
  
  if (signInError) {
    setSavingPass(false);
    return Alert.alert('Error', 'Current password is incorrect');
  }

  const { error } = await supabase.auth.updateUser({ password: newPass });
  setSavingPass(false);

  if (error) {
    Alert.alert('Error', error.message || 'Could not update password. Try again.');
  } else {
    Alert.alert('Success', 'Password updated successfully');
    setShowChangePass(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  }
};
  const handleDeleteAccount = () => {
  Alert.alert(
    'Delete Account',
    'This will take you to the account deletion page. Continue?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Continue', 
        style: 'destructive', 
        onPress: () => {
          navigation.navigate('DeleteAccount', { userId: profile.id });
        }
      }
    ]
  );
};
  return (
    <SafeAreaView style={editProfileStyles.container}>
      <View style={editProfileStyles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={editProfileStyles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={editProfileStyles.content}>
        <View style={editProfileStyles.avatarWrap}>
          <View style={editProfileStyles.avatar}>
            <Text style={editProfileStyles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        </View>
        <Text style={editProfileStyles.label}>Full Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={editProfileStyles.input}
          placeholder="Enter your name"
          placeholderTextColor="#9CA3AF"
        />
        <Text style={[editProfileStyles.label, { marginTop: 20 }]}>Email</Text>
        <TextInput
          value={profile?.email || ''}
          editable={false}
          style={[editProfileStyles.input, editProfileStyles.inputDisabled]}
        />
        <Text style={editProfileStyles.helperText}>
          Contact support to change your email
        </Text>
        <TouchableOpacity
          style={editProfileStyles.outlineButton}
          onPress={() => setShowChangePass(true)}
        >
          <Text style={editProfileStyles.outlineButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity 
  style={[
    editProfileStyles.primaryButton, 
    { opacity: nameChanged && !savingName ? 1 : 0.5 }
  ]} 
  onPress={handleSaveName} 
  disabled={!nameChanged || savingName}
>
  {savingName ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : (
    <Text style={editProfileStyles.primaryButtonText}>Save Changes</Text>
  )}
</TouchableOpacity>
        <View style={editProfileStyles.dangerZone}>
          <Text style={editProfileStyles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity onPress={handleDeleteAccount} disabled={deleting}>
  {deleting ? (
    <ActivityIndicator color="#EF4444" />
  ) : (
    <Text style={editProfileStyles.deleteText}>Delete Account</Text>
  )}
</TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showChangePass} animationType="fade" transparent>
        <View style={editProfileStyles.modalOverlay}>
          <View style={editProfileStyles.modalContent}>
            <View style={editProfileStyles.modalHeader}>
              <Text style={editProfileStyles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowChangePass(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            
            <Text style={editProfileStyles.label}>Current Password</Text>
            <TextInput
              value={currentPass}
              onChangeText={setCurrentPass}
              secureTextEntry
              style={editProfileStyles.input}
              placeholder="Enter current password"
              placeholderTextColor="#9CA3AF"
            />
            
            <Text style={[editProfileStyles.label, { marginTop: 16 }]}>New Password</Text>
            <TextInput
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry
              style={editProfileStyles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#9CA3AF"
            />
            
            <Text style={[editProfileStyles.label, { marginTop: 16 }]}>Confirm New Password</Text>
            <TextInput
              value={confirmPass}
              onChangeText={setConfirmPass}
              secureTextEntry
              style={editProfileStyles.input}
              placeholder="Re-enter password"
              placeholderTextColor="#9CA3AF"
            />
            
            <TouchableOpacity 
  style={[editProfileStyles.primaryButton, { marginTop: 24 }]} 
  onPress={handleChangePassword} 
  disabled={savingPass}
>
  {savingPass ? (
    <ActivityIndicator color="#FFFFFF" />
  ) : (
    <Text style={editProfileStyles.primaryButtonText}>Update Password</Text>
  )}
</TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const editProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#1E40AF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#1E40AF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  outlineButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
  modalContent: {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 20,
  width: '100%',
  maxWidth: 400,
},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});
//My subscription and billing screen 
function SubscriptionBillingScreen({ onBack, profile, setProfile }) {
  const [saving, setSaving] = useState(false);
  
  const isPro = profile?.plan === 'pro';
  const isCanceled = profile?.status === 'canceled';
  const renewalDate = profile?.current_period_end 
    ? new Date(profile.current_period_end).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      })
    : null;

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Pro Plan?',
      `You'll keep Pro access until ${renewalDate}, then move to Free Plan with 3 checks/day.`,
      [
        { text: 'Keep Pro', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            
            const { error } = await supabase
              .from('profiles')
              .update({ status: 'canceled' })
              .eq('id', profile.id);
            
            setSaving(false);
            
            if (error) {
              Alert.alert('Error', 'Could not cancel subscription. Please try again or contact support.');
            } else {
              setProfile({ ...profile, status: 'canceled' });
              Alert.alert(
                'Subscription Canceled', 
                `Canceled successfully. You still have Pro access until ${renewalDate}.`
              );
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={subscriptionStyles.container}>
      <View style={subscriptionStyles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={subscriptionStyles.headerTitle}>Subscription & Billing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={subscriptionStyles.content}>
        <View style={[
          subscriptionStyles.planCard,
          isPro && subscriptionStyles.planCardPro
        ]}>
          <View style={subscriptionStyles.planHeader}>
            <Text style={subscriptionStyles.planName}>
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </Text>
            <View style={[
              subscriptionStyles.statusBadge,
              isPro ? subscriptionStyles.statusBadgePro : subscriptionStyles.statusBadgeFree,
              isCanceled && subscriptionStyles.statusBadgeCanceled
            ]}>
              <Text style={[
                subscriptionStyles.statusText,
                isPro && subscriptionStyles.statusTextPro,
                isCanceled && subscriptionStyles.statusTextCanceled
              ]}>
                {isCanceled ? 'Canceled' : 'Active'}
              </Text>
            </View>
          </View>
          
          <Text style={subscriptionStyles.planPrice}>
            {isPro ? '₦1,000' : '₦0'}
            <Text style={subscriptionStyles.planPeriod}>/month</Text>
          </Text>
          
          {isPro && renewalDate && (
            <Text style={subscriptionStyles.renewalText}>
              {isCanceled ? 'Access until ' : 'Renews on '}{renewalDate}
            </Text>
          )}
        </View>

        <View style={subscriptionStyles.section}>
          <Text style={subscriptionStyles.sectionTitle}>Daily Usage</Text>
          {isPro ? (
            <View style={subscriptionStyles.usageRow}>
              <Ionicons name="infinite" size={20} color="#10B981" />
              <Text style={subscriptionStyles.usageText}>Unlimited Scam Checks Today</Text>
            </View>
          ) : (
            <View style={subscriptionStyles.usageRow}> 
  <Ionicons name="checkmark-circle" size={20} color="#10B981" /> 
  <Text style={subscriptionStyles.usageText}>3 checks per day</Text> 
</View>
          )}
        </View>

        <View style={subscriptionStyles.section}>
          <Text style={subscriptionStyles.sectionTitle}>Plan Features</Text>
          <View style={subscriptionStyles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={isPro ? "#10B981" : "#111827"} />
            <Text style={subscriptionStyles.featureText}>3 checks per day</Text>
          </View>
          <View style={subscriptionStyles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={isPro ? "#10B981" : "#9CA3AF"} />
            <Text style={[subscriptionStyles.featureText, !isPro && subscriptionStyles.featureDisabled]}>
              Unlimited checks
            </Text>
          </View>
          <View style={subscriptionStyles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={isPro ? "#10B981" : "#9CA3AF"} />
            <Text style={[subscriptionStyles.featureText, !isPro && subscriptionStyles.featureDisabled]}>
              Priority AI detection
            </Text>
          </View>
          <View style={subscriptionStyles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={isPro ? "#10B981" : "#9CA3AF"} />
            <Text style={[subscriptionStyles.featureText, !isPro && subscriptionStyles.featureDisabled]}>
              Email support
            </Text>
          </View>
        </View>

        {isPro && !isCanceled && (
          <TouchableOpacity 
            style={subscriptionStyles.cancelButton}
            onPress={handleCancelSubscription}
            disabled={saving}
          >
            <Text style={subscriptionStyles.cancelButtonText}>
              {saving ? 'Canceling...' : 'Cancel Subscription'}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={subscriptionStyles.footerText}>
  To upgrade or manage payment, contact{' '}
  <Text 
    style={{ color: '#1a73e8', textDecorationLine: 'underline', fontWeight: '600' }}
    onPress={() => {
      Linking.openURL('mailto:scamdetector.support@gmail.com?subject=Scam Detector Billing').catch(() => {
        Alert.alert('Error', 'Could not open email app');
      });
    }}
  >
    scamdetector.support@gmail.com
  </Text>
</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const subscriptionStyles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  planCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  planCardPro: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeFree: {
    backgroundColor: '#E5E7EB',
  },
  statusBadgePro: {
    backgroundColor: '#10B981',
  },
  statusBadgeCanceled: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  statusTextPro: {
    color: '#FFFFFF',
  },
  statusTextCanceled: {
    color: '#DC2626',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
  },
  renewalText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usageText: {
    fontSize: 15,
    color: '#111827',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1E3A8A',
    borderRadius: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#111827',
  },
  featureDisabled: {
    color: '#9CA3AF',
  },
  cancelButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
};
                             
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user);
    });
  }, []);
  const [showAbout, setShowAbout] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [checksLeft, setChecksLeft] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
  // Don't do anything until user is fully loaded
  if (!user?.id) {
    console.log('Waiting for user...');
    return;
  }

  const loadRealCount = async () => {
    try {
      console.log('Fetching count for user:', user.id);
      const response = await fetch(`https://scam-detector-backend.vercel.app/api/get-limit?userId=${user.id}&t=${Date.now()}`);
      const data = await response.json();
      console.log('Got count:', data.checksRemaining);
      setChecksLeft(data.checksRemaining ?? 0);
    } catch (error) {
      console.log('Error fetching count:', error);
      setChecksLeft(3);
    }
  };
  
  loadRealCount();
}, [user?.id]);

     const handleCheckScam = async () => {
     if (!user?.id) {
  Alert.alert('Error', 'Still loading. Try again.');
  return;
}
  if (checksLeft === 0) {
    setShowLimitModal(true);
    return;
  }
  if (!message.trim()) return;
  
  setLoading(true);
  setResult(null);
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('https://scam-detector-backend.vercel.app/api/check-scam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message, userId: user?.id }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    const data = await response.json();
    
    if (response.status === 429) {
      setShowLimitModal(true);
      setChecksLeft(0);
      return;
    }
    
    if (!response.ok) {
      Alert.alert('Error', data.error || 'Something went wrong');
      setChecksLeft(data.checksRemaining ?? checksLeft);
      return;
    }
    
    setResult(data);
    setChecksLeft(data.checksRemaining);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      Alert.alert('Network Error', 'Request timed out. Check your connection and try again.');
    } else {
      Alert.alert('Network Error', 'Failed to reach server. Check your connection and try again.');
    }
  } finally {
    setLoading(false);
  }
};

const getResultColor = (status) => {
  switch (status) {
    case 'HIGH_RISK': return '#EF4444';
    case 'SUSPICIOUS': return '#F59E0B';
    case 'NO_CONTEXT': return '#6B7280';
    case 'SAFE': return '#10B981';
    default: return '#6B7280';
  }
};
  // --- Button START ---
  if (showAbout) return <AboutScreen onBack={() => setShowAbout(false)} />;
  if (showAdvance) return <AdvanceScreen onBack={() => setShowAdvance(false)} />;
  if (currentScreen === 'profile') return (
  <ProfileScreen 
    setCurrentScreen={setCurrentScreen}
    setChecksLeft={setChecksLeft}
    setShowAdvance={setShowAdvance}
    profile={profile}        
    setProfile={setProfile}  
  />
);
if (currentScreen === 'editProfile') return (
  <EditProfileScreen 
    onBack={() => setCurrentScreen('profile')} 
    profile={profile} 
    setProfile={setProfile}
  />
);
if (currentScreen === 'billing') return (
  <SubscriptionBillingScreen 
    onBack={() => setCurrentScreen('profile')} 
    profile={profile} 
    setProfile={setProfile} 
  />
);
  if (currentScreen === 'privacy') return <PrivacyPolicyScreen onBack={() => setCurrentScreen('home')} />;
  if (currentScreen === 'terms') return <TermsScreen onBack={() => setCurrentScreen('home')} />;
  if (currentScreen === 'refund') return <RefundPolicyScreen onBack={() => setCurrentScreen('home')} />;
  // --- Button END ---
    if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView style={styles.safe}>
   
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
{/* Header */}
<View style={styles.header}>
  <View style={styles.headerLeft}>
    <TouchableOpacity onPress={() => setMenuOpen(true)}>
      <Feather name="menu" size={24} color="#0F172A" />
    </TouchableOpacity>
    <Text style={styles.logoText}>Scam Detector</Text>
  </View>
  
  <View style={styles.headerRight}>
    <TouchableOpacity onPress={() => setShowAbout(true)}>
      <Text style={styles.aboutText}>About</Text>
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.upgradeBtn} onPress={() => setShowAdvance(true)}>
      <FontAwesome name="diamond" size={12} color="#FFFFFF" />
      <Text style={styles.upgradeText}>Advance</Text>
    </TouchableOpacity>
  </View>
</View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.tag}>
            <MaterialIcons name="flash-on" size={14} color="#0D47A1" />
            <Text style={styles.tagText}>AI-Powered Scam Detection</Text>
          </View>
          
          <Text style={styles.heroTitle}>Protect Yourself</Text>
          <Text style={styles.heroTitle}>From <Text style={styles.heroBlue}>Online Scams</Text></Text>
          
          <Text style={styles.heroSubtext}>
            Check WhatsApp messages, SMS texts, and suspicious links instantly with our advanced AI scam detection.
          </Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="message-text-outline" size={16} color="#555" />
              <Text style={styles.cardHeaderText}>Paste message, text or link to check</Text>
            </View>
            </View>

          <TextInput
            style={styles.input}
            placeholder="Paste a message, phone number, suspicious link, or any content you want to verify..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            placeholderTextColor="#999"
          />
          <Text style={styles.charCount}>{message.length}/1000</Text>

          <TouchableOpacity 
  style={[
    styles.checkBtn, 
    (loading || checksLeft === 0 || checksLeft === null) && { backgroundColor: '#BDBDBD' }
  ]} 
  onPress={handleCheckScam} 
  disabled={loading || checksLeft === 0 || checksLeft === null}
  activeOpacity={0.2}
> 
  {loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="search" size={18} color="#FFFFFF" />}
  <Text style={styles.checkBtnText}> 
    {loading ? 'Checking...' : checksLeft === null ? 'Loading...' : checksLeft === 0 ? 'Get Advance to Continue' : 'Check Scam'}
  </Text> 
</TouchableOpacity> 

<View style={styles.limitRow}> 
  <View style={styles.limitItem}> 
    <MaterialIcons name="verified" size={14} color="#2E7D32" /> 
    <Text style={styles.limitText}>
      {checksLeft === null ? 'Loading...' : `${checksLeft} free checks remaining`}
    </Text> 
  </View> 
</View>
</View>
        
        {/* Result Card */} 
{result && ( 
  <View style={styles.detectionCard}> 
    {/* Header */} 
    <View style={styles.detectionCardHeader}> 
      <View style={styles.detectionCardTitleRow}> 
        <MaterialCommunityIcons name="shield-check" size={18} color="#059669" /> 
        <Text style={styles.detectionCardTitle}>Detection Result</Text> 
      </View> 
      <View style={styles.detectionCheckedRow}> 
        <Text style={styles.detectionCheckedText}>Checked just now</Text> 
        <View style={styles.detectionGreenDot} /> 
      </View> 
    </View> 
    
    {/* Content: Left = Score, Right = Signals */} 
    <View style={styles.detectionContent}> 
      {/* Left Column */} 
      <View style={styles.detectionLeftColumn}> 
        <Text style={styles.riskScoreLabel}>Risk Score</Text> 
        <Text style={[styles.riskScore, { color: getResultColor(result.status || 'UNKNOWN') }]}> 
          {result.score ?? 0}<Text style={styles.riskScoreTotal}>/100</Text> 
        </Text> 
        
        <View style={[styles.statusBadge, { backgroundColor: getResultColor(result.status || 'UNKNOWN') }]}> 
          <MaterialIcons 
            name={(result.status === 'SAFE' || result.status === 'NO_CONTEXT') ? 'check' : 'warning'} 
            size={14} 
            color="#FFFFFF" 
          /> 
          <Text style={styles.statusBadgeText}> 
            {(result.status || 'UNKNOWN').replace('_', ' ')} 
          </Text> 
        </View> 
        
        <Text style={styles.resultDescription}> 
          {result.message || 'No message from server'} 
        </Text> 
      </View> 
      
      {/* Right Column */} 
      <View style={styles.detectionRightColumn}> 
        <Text style={styles.signalsTitle}> 
          {result.status === 'SAFE' ? 'Why this is safe:' : 
           result.status === 'NO_CONTEXT' ? 'Why we need more info:' : 
           'Why this is dangerous:'} 
        </Text> 
        {result.reasons?.length > 0 ? ( 
          result.reasons.map((reason, i) => ( 
            <View key={i} style={styles.signalRow}> 
              <MaterialIcons 
                name={result.status === 'SAFE' ? 'check-circle' : 'warning'} 
                size={16} 
                color={result.status === 'SAFE' ? '#10B981' : getResultColor(result.status || 'UNKNOWN')} 
              /> 
              <Text style={styles.signalText}>{reason}</Text> 
            </View> 
          )) 
        ) : ( 
          <Text style={styles.signalText}>No specific indicators found.</Text> 
        )} 
      </View> 
    </View>

    {/* Footer */}
    <View style={styles.detectionFooter}>
      <MaterialCommunityIcons name="shield-check-outline" size={14} color="#6B7280" />
      <Text style={styles.detectionFooterText}>
        Our AI analyzed this content using 50+ scam detection signals
      </Text>
    </View>
  </View>
    )}
  
        {/* Features Row */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#0D47A1" />
            <Text style={styles.featureTitle}>AI-Powered Protection</Text>
            <Text style={styles.featureDesc}>Advanced AI models detect scams in real-time</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="flash-on" size={20} color="#0D47A1" />
            <Text style={styles.featureTitle}>Instant Results</Text>
            <Text style={styles.featureDesc}>Get results in seconds, stay protected</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="lock-outline" size={20} color="#0D47A1" />
            <Text style={styles.featureTitle}>Privacy First</Text>
            <Text style={styles.featureDesc}>Your data is private and never stored</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color="#0D47A1" />
            <Text style={styles.featureTitle}>Trusted Protection</Text>
            <Text style={styles.featureDesc}>Join thousands of users staying safe online</Text>
          </View>
        </View>

        {/* Trust Banner */}
        <View style={styles.trustBanner}>
          <MaterialIcons name="verified" size={16} color="#666" />
          <Text style={styles.trustText}>Trusted by security experts and users worldwide</Text>
          <View style={styles.avatars}>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>10K+</Text>
            </View>
          <View style={styles.stars}>
            <FontAwesome name="star" size={12} color="#FFB300" />
            <FontAwesome name="star" size={12} color="#FFB300" />
            <FontAwesome name="star" size={12} color="#FFB300" />
            <FontAwesome name="star" size={12} color="#FFB300" />
            <FontAwesome name="star-half-full" size={12} color="#FFB300" />
            <Text style={styles.ratingText}>4.9/5 from 10,000+ reviews</Text>
          </View>
          </View>
        </View>
      </ScrollView>
      <Modal
  visible={showLimitModal}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setShowLimitModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <MaterialIcons name="lock" size={32} color="#C62828" />
      <Text style={styles.modalTitle}>Daily Limit Reached</Text>
      <Text style={styles.modalText}>
        You've used all your 3 free checks today. Upgrade to Advance for unlimited checks or wait for 23h 59m.
      </Text>
      <TouchableOpacity 
  style={styles.modalUpgradeBtn} 
  onPress={() => {
    setShowLimitModal(false);
    setShowAdvance(true);
  }}
>
  <FontAwesome name="diamond" size={14} color="#FFFFFF" />
  <Text style={styles.modalBtnText}>Get Advance</Text>
</TouchableOpacity>
      <TouchableOpacity onPress={() => setShowLimitModal(false)}>
        <Text style={styles.modalCancel}>Maybe Later</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
      {/* Hamburger Menu Modal */}
<Modal visible={menuOpen} transparent={true} animationType="fade" onRequestClose={() => setMenuOpen(false)} >
  <TouchableOpacity style={menuStyles.overlay} activeOpacity={1} onPress={() => setMenuOpen(false)} >
    <View style={menuStyles.menuBox}>
<TouchableOpacity style={menuStyles.menuItem} onPress={() => { setMenuOpen(false); setCurrentScreen('profile'); }} >
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="person-circle-outline" size={22} color="#111827" style={{ marginRight: 12 }} />
      <Text style={menuStyles.menuText}>Profile</Text>
    </View>
    <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
  </View>
</TouchableOpacity>
      <View style={menuStyles.divider} />
      <TouchableOpacity style={menuStyles.menuItem} onPress={() => { setMenuOpen(false); setCurrentScreen('privacy'); }} >
        <Text style={menuStyles.menuText}>Privacy Policy</Text>
      </TouchableOpacity>
      <View style={menuStyles.divider} />
      <TouchableOpacity style={menuStyles.menuItem} onPress={() => { setMenuOpen(false); setCurrentScreen('terms'); }} >
        <Text style={menuStyles.menuText}>Terms & Conditions</Text>
      </TouchableOpacity>
      <View style={menuStyles.divider} />
      <TouchableOpacity style={menuStyles.menuItem} onPress={() => { setMenuOpen(false); setCurrentScreen('refund'); }} >
        <Text style={menuStyles.menuText}>Refund Policy</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FA' },
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  aboutText: { fontSize: 14, color: '#555' },
  upgradeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D47A1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, gap: 4 },
  upgradeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  hero: { padding: 24, alignItems: 'center' },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, marginBottom: 16 },
  tagText: { color: '#0D47A1', fontSize: 12, fontWeight: '500' },
  heroTitle: { fontSize: 32, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  heroBlue: { color: '#0D47A1' },
  heroSubtext: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 12, lineHeight: 20, paddingHorizontal: 10 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardHeaderText: { fontSize: 13, color: '#555', fontWeight: '500' },
  pasteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pasteText: { fontSize: 13, color: '#555' },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, minHeight: 100, textAlignVertical: 'top', fontSize: 14, color: '#1A1A1A' },
  charCount: { fontSize: 11, color: '#999', textAlign: 'right', marginTop: 4 },
  checkBtn: { flexDirection: 'row', backgroundColor: '#0D47A1', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  checkBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  limitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 8 },
  limitItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  limitText: { fontSize: 12, color: '#666' },
  dot: { color: '#999' },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultHeaderText: { fontSize: 13, fontWeight: '600', color: '#555' },
  resultHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 12, color: '#999' },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2E7D32' },
  resultBody: { flexDirection: 'row', gap: 16 },
  scoreBox: { flex: 1 },
  riskLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  scoreText: { fontSize: 36, fontWeight: '700', color: '#2E7D32' },
  scoreOutOf: { fontSize: 18, color: '#999' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4, marginTop: 8 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  scoreDesc: { fontSize: 12, color: '#666', marginTop: 12, lineHeight: 16 },
  reasonsBox: { flex: 1.2 },
  reasonsTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8 },
  reasonText: { fontSize: 12, color: '#555', flex: 1, lineHeight: 16 },
  resultFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  footerText: { fontSize: 11, color: '#666', flex: 1 },
  features: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 16, gap: 12 },
  featureItem: { width: '48%', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  featureTitle: { fontSize: 12, fontWeight: '600', color: '#1A1A1A', marginTop: 8, textAlign: 'center' },
  featureDesc: { fontSize: 11, color: '#666', marginTop: 4, textAlign: 'center', lineHeight: 14 },
  trustBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 30, padding: 12, borderRadius: 8, flexWrap: 'wrap', gap: 8 },
  trustText: { fontSize: 11, color: '#666', flex: 1 },
  avatars: { flexDirection: 'row' },
  avatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#DDD', marginLeft: -6, borderWidth: 2, borderColor: '#FFFFFF' },
  avatarBadge: { backgroundColor: '#0D47A1', paddingHorizontal: 6, borderRadius: 10, marginLeft: -6, justifyContent: 'center' },
  avatarBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '600' },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, color: '#666', marginLeft: 4 },
modalOverlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalBox: {
  backgroundColor: '#FFFFFF',
  padding: 24,
  borderRadius: 12,
  alignItems: 'center',
  width: '90%'
},
modalTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1A1A1A',
  marginTop: 12,
  marginBottom: 8
},
modalText: {
  fontSize: 14,
  color: '#666',
  textAlign: 'center',
  lineHeight: 20,
  marginBottom: 20
},
modalUpgradeBtn: {
  flexDirection: 'row',
  backgroundColor: '#0D47A1',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  alignItems: 'center',
  gap: 8,
  width: '100%',
  justifyContent: 'center'
},
modalBtnText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '600'
},
modalCancel: {
  color: '#666',
  fontSize: 14,
  marginTop: 12
  },
  detectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  detectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detectionCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detectionCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  detectionCheckedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detectionCheckedText: {
    fontSize: 12,
    color: '#6B7280',
  },
  detectionGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  detectionContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  detectionLeftColumn: {
    flex: 1,
  },
  detectionRightColumn: {
    flex: 1.2,
  },
  riskScoreLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  riskScore: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
  },
  riskScoreTotal: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resultDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  signalsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  signalText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  detectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detectionFooterText: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
});
const menuStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingLeft: 16,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
