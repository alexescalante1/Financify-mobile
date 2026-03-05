import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { ThemeContainer } from '@/presentation/components/container/ThemeContainer';
import { HeaderBar } from '@/presentation/components/navigation/HeaderBar';
import { ExpandableCard } from '@/presentation/components/card/ExpandableCard';
import { FinancifyButton } from '@/presentation/components/button/FinancifyButton';
import { FABAction } from '@/presentation/components/button/FABAction';
import { SimpleCard } from '@/presentation/components/card/SimpleCard';
import { StatsCard } from '@/presentation/components/card/StatsCard';
import { FormSection } from '@/presentation/components/form/FormSection';
import { FormInput } from '@/presentation/components/form/FormInput';
import { FormikInput } from '@/presentation/components/form/FormikInput';
import { CurrencyInput } from '@/presentation/components/form/CurrencyInput';
import { TextArea } from '@/presentation/components/form/TextArea';
import { RadioGroup } from '@/presentation/components/form/RadioGroup';
import { SwitchToggle } from '@/presentation/components/form/SwitchToggle';
import { DatePicker } from '@/presentation/components/picker/DatePicker';
import { SelectorInput } from '@/presentation/components/picker/SelectorInput';
import { EmptyState } from '@/presentation/components/feedback/EmptyState';
import { ErrorState } from '@/presentation/components/feedback/ErrorState';
import { LoadingOverlay } from '@/presentation/components/feedback/LoadingOverlay';
import { AlertBanner } from '@/presentation/components/feedback/AlertBanner';
import { AmountDisplay } from '@/presentation/components/display/AmountDisplay';
import { AnimatedNumber } from '@/presentation/components/animated/AnimatedNumber';
import { ListItem } from '@/presentation/components/list/ListItem';
import { SwipeableRow } from '@/presentation/components/list/SwipeableRow';
import { ChipGroup } from '@/presentation/components/chip/ChipGroup';
import { AnimatedDialog } from '@/presentation/components/dialog/AnimatedDialog';
import { ConfirmDialog } from '@/presentation/components/dialog/ConfirmDialog';
import { ProgressBar } from '@/presentation/components/progress/ProgressBar';
import { SearchBar } from '@/presentation/components/search/SearchBar';
import { SkeletonLoader } from '@/presentation/components/skeleton/SkeletonLoader';
import { DividerWithText } from '@/presentation/components/divider/DividerWithText';
import { AvatarGroup } from '@/presentation/components/avatar/AvatarGroup';
import { Badge } from '@/presentation/components/badge/Badge';
import { FinancifyLineChart } from '@/presentation/components/chart/FinancifyLineChart';
import { FinancifyBarChart } from '@/presentation/components/chart/FinancifyBarChart';
import { FinancifyPieChart } from '@/presentation/components/chart/FinancifyPieChart';
import { InputDialog } from '@/presentation/components/dialog/InputDialog';
import { SelectionDialog } from '@/presentation/components/dialog/SelectionDialog';
import { FullScreenModal } from '@/presentation/components/modal/FullScreenModal';
import { FinancifyBottomSheet } from '@/presentation/components/sheet/FinancifyBottomSheet';
import { CompactCard } from '@/presentation/components/card/CompactCard';
import { GradientCard } from '@/presentation/components/card/GradientCard';
import { ActionCard } from '@/presentation/components/card/ActionCard';
import { SegmentedControl } from '@/presentation/components/control/SegmentedControl';
import { CategoryIcon } from '@/presentation/components/icon/CategoryIcon';
import { ChartLegend } from '@/presentation/components/chart/ChartLegend';
import { SectionHeader } from '@/presentation/components/header/SectionHeader';
import { TransactionCard } from '@/presentation/components/transaction/TransactionCard';
import { NumericKeypad } from '@/presentation/components/input/NumericKeypad';
import { FilterBar } from '@/presentation/components/filter/FilterBar';
import { StepIndicator } from '@/presentation/components/indicator/StepIndicator';
import { OTPInput } from '@/presentation/components/input/OTPInput';
import { PINKeypad } from '@/presentation/components/input/PINKeypad';
import { InfoTip } from '@/presentation/components/tooltip/InfoTip';
import { CopyButton } from '@/presentation/components/button/CopyButton';
import { CountdownTimer } from '@/presentation/components/timer/CountdownTimer';
import { Carousel } from '@/presentation/components/carousel/Carousel';
import { NotificationBell } from '@/presentation/components/notification/NotificationBell';
import { ErrorBoundary } from '@/presentation/components/feedback/ErrorBoundary';
import { PullToRefresh } from '@/presentation/components/wrapper/PullToRefresh';
import { KeyboardAvoidingWrapper } from '@/presentation/components/wrapper/KeyboardAvoidingWrapper';
import { DateRangePicker } from '@/presentation/components/picker/DateRangePicker';
import { SmoothPopupFullScreen } from '@/presentation/components/screen/SmoothPopupFullScreen';
import { OptimizedParticlesBackground } from '@/presentation/components/animated/OptimizedParticlesBackground';
import { useSnackbar } from '@/presentation/components/feedback/SnackbarProvider';
import { MaskedInput } from '@/presentation/components/input/MaskedInput';
import { PhoneNumberInput } from '@/presentation/components/input/PhoneNumberInput';
import { SwipeToConfirm } from '@/presentation/components/gesture/SwipeToConfirm';
import { ConnectionStatus } from '@/presentation/components/status/ConnectionStatus';
import { PercentageBadge } from '@/presentation/components/badge/PercentageBadge';
import { CircularProgressRing } from '@/presentation/components/progress/CircularProgressRing';
import { Checkbox } from '@/presentation/components/control/Checkbox';
import type { AppTheme } from '@/presentation/theme/materialTheme';

const noop = () => {};
const alertPress = () => Alert.alert('Presionado');

const RADIO_OPTIONS = [
  { key: 'ingreso', label: 'Ingreso' },
  { key: 'gasto', label: 'Gasto' },
  { key: 'transferencia', label: 'Transferencia' },
];

const SELECTOR_OPTIONS = [
  { key: 'food', label: 'Alimentacion', icon: 'food', description: 'Comida y bebidas' },
  { key: 'transport', label: 'Transporte', icon: 'car', description: 'Movilidad' },
  { key: 'health', label: 'Salud', icon: 'hospital-box', description: 'Gastos medicos' },
  { key: 'entertainment', label: 'Entretenimiento', icon: 'gamepad-variant', description: 'Ocio' },
];

const CHIP_OPTIONS = [
  { key: 'all', label: 'Todos' },
  { key: 'income', label: 'Ingresos', icon: 'arrow-up' },
  { key: 'expense', label: 'Gastos', icon: 'arrow-down' },
  { key: 'transfer', label: 'Transferencias', icon: 'swap-horizontal' },
];

const FORMIK_SCHEMA = Yup.object({
  nombre: Yup.string().required('El nombre es requerido').min(3, 'Minimo 3 caracteres'),
  email: Yup.string().required('El email es requerido').email('Email invalido'),
  monto: Yup.string().required('El monto es requerido'),
});

const LINE_CHART_DATA = [
  { value: 1200, label: 'Ene' },
  { value: 1800, label: 'Feb' },
  { value: 1500, label: 'Mar' },
  { value: 2200, label: 'Abr' },
  { value: 1900, label: 'May' },
  { value: 2800, label: 'Jun' },
];

const BAR_CHART_DATA = [
  { value: 850, label: 'Ene' },
  { value: 1200, label: 'Feb' },
  { value: 950, label: 'Mar' },
  { value: 1400, label: 'Abr' },
  { value: 1100, label: 'May' },
  { value: 1600, label: 'Jun' },
];

const PIE_CHART_DATA = [
  { value: 35, text: '35%' },
  { value: 25, text: '25%' },
  { value: 20, text: '20%' },
  { value: 12, text: '12%' },
  { value: 8, text: '8%' },
];

const ACCOUNT_OPTIONS = [
  { key: 'personal', label: 'Cuenta Personal', icon: 'account', description: 'Tu cuenta principal' },
  { key: 'savings', label: 'Ahorros', icon: 'piggy-bank', description: 'Meta de ahorro' },
  { key: 'business', label: 'Negocio', icon: 'briefcase', description: 'Cuenta empresarial' },
];

const SEGMENT_OPTIONS = [
  { key: 'dia', label: 'Dia' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mes' },
  { key: 'anio', label: 'Ano' },
];

const LEGEND_ITEMS = [
  { label: 'Alimentacion', color: '#FF6384', value: '35%' },
  { label: 'Transporte', color: '#36A2EB', value: '25%' },
  { label: 'Entretenimiento', color: '#FFCE56', value: '20%' },
  { label: 'Salud', color: '#4BC0C0', value: '12%' },
  { label: 'Otros', color: '#9966FF', value: '8%' },
];

const INITIAL_FILTERS = [
  { key: 'month', label: 'Marzo 2026', icon: 'calendar' },
  { key: 'type', label: 'Gastos' },
  { key: 'category', label: 'Alimentacion', icon: 'food' },
];

export const ComponentPreviewScreen: React.FC = () => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];
  const navigation = useNavigation();

  // Form state
  const [formText, setFormText] = useState('Maria Garcia');
  const [formEmail, setFormEmail] = useState('maria@email.com');
  const [formPassword, setFormPassword] = useState('secret123');
  const [currencyValue, setCurrencyValue] = useState<number | undefined>(1250.50);
  const [textAreaValue, setTextAreaValue] = useState('Pago del alquiler mensual');
  const [radioValue, setRadioValue] = useState('ingreso');
  const [switchValue, setSwitchValue] = useState(true);

  // Picker state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectorValue, setSelectorValue] = useState('food');

  // Chip state
  const [selectedChip, setSelectedChip] = useState('all');

  // Search state
  const [searchText, setSearchText] = useState('');

  // Dialog state
  const [animatedDialogVisible, setAnimatedDialogVisible] = useState(false);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [inputDialogVisible, setInputDialogVisible] = useState(false);
  const [selectionDialogVisible, setSelectionDialogVisible] = useState(false);

  // Modal/Sheet state
  const [fullModalVisible, setFullModalVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  // Loading state
  const [loadingVisible, setLoadingVisible] = useState(false);

  // Alert state
  const [alertDismissed, setAlertDismissed] = useState(false);

  // OTP state
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);

  // PIN state
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState(false);

  // Countdown state
  const [countdownKey, setCountdownKey] = useState(0);

  // PullToRefresh state
  const [refreshing, setRefreshing] = useState(false);

  // ErrorBoundary state
  const [shouldCrash, setShouldCrash] = useState(false);

  // DateRange state
  const [rangeStart, setRangeStart] = useState(new Date());
  const [rangeEnd, setRangeEnd] = useState(new Date());

  // SmoothPopup state
  const [smoothPopupVisible, setSmoothPopupVisible] = useState(false);

  // Segmented state
  const [segmentedValue, setSegmentedValue] = useState('mes');

  // Keypad state
  const [keypadValue, setKeypadValue] = useState('');

  // MaskedInput state
  const [cardNumber, setCardNumber] = useState('');

  // PhoneNumberInput state
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('PE');

  // Checkbox state
  const [checkTerms, setCheckTerms] = useState(false);
  const [checkNotif, setCheckNotif] = useState(true);
  const [checkPromo, setCheckPromo] = useState(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState(INITIAL_FILTERS);

  // Step state
  const [currentStep, setCurrentStep] = useState(2);

  // Animated values
  const [animatedNumberValue, setAnimatedNumberValue] = useState(15420.75);
  const [progressValue, setProgressValue] = useState(0.65);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const { showSnackbar } = useSnackbar();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <ThemeContainer>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HeaderBar title="Vista de Componentes" onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ═══ BOTONES ═══ */}
        <ExpandableCard title="Botones" variant="default" initialExpanded>
          <Text variant="labelLarge" style={styles.sectionLabel}>Variantes</Text>
          <View style={styles.gap}>
            <FinancifyButton title="Primary" variant="primary" onPress={alertPress} />
            <FinancifyButton title="Secondary" variant="secondary" onPress={alertPress} />
            <FinancifyButton title="Tertiary" variant="tertiary" onPress={alertPress} />
            <FinancifyButton title="Danger" variant="danger" onPress={alertPress} />
            <FinancifyButton title="Success" variant="success" onPress={alertPress} />
            <FinancifyButton title="Warning" variant="warning" onPress={alertPress} />
            <FinancifyButton title="Outline" variant="outline" onPress={alertPress} />
            <FinancifyButton title="Ghost" variant="ghost" onPress={alertPress} />
          </View>

          <Text variant="labelLarge" style={styles.sectionLabel}>Estados</Text>
          <View style={styles.gap}>
            <FinancifyButton title="Loading..." variant="primary" loading />
            <FinancifyButton title="Disabled" variant="primary" disabled />
            <FinancifyButton title="Con Icono" variant="primary" icon="plus" onPress={alertPress} />
            <FinancifyButton title="Full Width" variant="primary" fullWidth onPress={alertPress} />
          </View>

          <Text variant="labelLarge" style={styles.sectionLabel}>FABAction</Text>
          <View style={styles.fabContainer}>
            <FABAction icon="plus" label="Agregar" onPress={alertPress} position="bottom-right" />
          </View>
        </ExpandableCard>

        {/* ═══ TARJETAS ═══ */}
        <ExpandableCard title="Tarjetas">
          <Text variant="labelLarge" style={styles.sectionLabel}>SimpleCard</Text>
          <SimpleCard>
            <Text>Contenido de una tarjeta simple</Text>
          </SimpleCard>
          <SimpleCard variant="blue" style={styles.mt8}>
            <Text>Tarjeta con variante azul</Text>
          </SimpleCard>
          <SimpleCard variant="green" style={styles.mt8}>
            <Text>Tarjeta con variante verde</Text>
          </SimpleCard>

          <Text variant="labelLarge" style={styles.sectionLabel}>StatsCard</Text>
          <StatsCard
            title="Ingresos"
            value="S/ 8,500.00"
            icon="trending-up"
            trend={{ direction: 'up', value: '+12.5%', label: 'vs mes anterior' }}
          />
          <StatsCard
            title="Gastos"
            value="S/ 3,200.00"
            icon="trending-down"
            trend={{ direction: 'down', value: '-5.2%', label: 'vs mes anterior' }}
            style={styles.mt8}
          />
          <StatsCard
            title="Balance"
            value="S/ 5,300.00"
            icon="wallet"
            trend={{ direction: 'neutral', value: '0%', label: 'sin cambios' }}
            variant="purple"
            style={styles.mt8}
          />
          <Text variant="labelSmall" style={styles.mt8}>Loading state:</Text>
          <StatsCard
            title="Cargando..."
            value=""
            loading
            style={styles.mt8}
          />

          <Text variant="labelLarge" style={styles.sectionLabel}>ExpandableCard</Text>
          <ExpandableCard title="Card expandible anidada" variant="teal">
            <Text>Este contenido se puede expandir y contraer</Text>
          </ExpandableCard>
        </ExpandableCard>

        {/* ═══ FORMULARIOS ═══ */}
        <ExpandableCard title="Formularios">
          <FormSection title="Datos Personales" subtitle="Ingrese su informacion">
            <FormInput label="Nombre" value={formText} onChangeText={setFormText} icon="account" />
            <FormInput label="Email" value={formEmail} onChangeText={setFormEmail} icon="email" keyboardType="email-address" />
            <FormInput label="Contrasena" value={formPassword} onChangeText={setFormPassword} secureTextEntry />
            <FormInput label="Con Error" value="" onChangeText={noop} error errorMessage="Este campo es requerido" />
          </FormSection>

          <Text variant="labelLarge" style={styles.sectionLabel}>CurrencyInput</Text>
          <CurrencyInput label="Monto (PEN)" value={currencyValue} onValueChange={setCurrencyValue} currency="PEN" />
          <CurrencyInput label="Monto (USD)" value={99.99} onValueChange={noop} currency="USD" style={styles.mt8} />

          <Text variant="labelLarge" style={styles.sectionLabel}>TextArea</Text>
          <TextArea label="Descripcion" value={textAreaValue} onChangeText={setTextAreaValue} maxLength={200} showCharCount />

          <Text variant="labelLarge" style={styles.sectionLabel}>RadioGroup</Text>
          <RadioGroup
            label="Tipo de movimiento"
            options={RADIO_OPTIONS}
            value={radioValue}
            onValueChange={setRadioValue}
          />

          <Text variant="labelLarge" style={styles.sectionLabel}>SwitchToggle</Text>
          <SwitchToggle label="Notificaciones" value={switchValue} onValueChange={setSwitchValue} description="Recibir alertas de gastos" />
          <SwitchToggle label="Modo oscuro" value={false} onValueChange={noop} disabled style={styles.mt8} />
        </ExpandableCard>

        {/* ═══ SELECTORES ═══ */}
        <ExpandableCard title="Selectores">
          <DatePicker label="Fecha de transaccion" value={selectedDate} onChange={setSelectedDate} />
          <SelectorInput
            label="Categoria"
            value={selectorValue}
            onSelect={setSelectorValue}
            icon="shape"
            options={SELECTOR_OPTIONS}
            style={styles.mt12}
          />
          <Text variant="labelLarge" style={styles.sectionLabel}>DateRangePicker</Text>
          <DateRangePicker
            startDate={rangeStart}
            endDate={rangeEnd}
            onStartDateChange={setRangeStart}
            onEndDateChange={setRangeEnd}
          />
        </ExpandableCard>

        {/* ═══ FEEDBACK ═══ */}
        <ExpandableCard title="Feedback">
          <EmptyState
            icon="inbox-outline"
            title="Sin transacciones"
            description="Agrega tu primera transaccion para comenzar"
            actionLabel="Agregar"
            onAction={alertPress}
            style={styles.feedbackContainer}
          />
          <DividerWithText text="separador" style={styles.mv12} />
          <ErrorState
            title="Error de conexion"
            message="No se pudieron cargar los datos"
            onRetry={alertPress}
            style={styles.feedbackContainer}
          />
        </ExpandableCard>

        {/* ═══ DISPLAY ═══ */}
        <ExpandableCard title="Display">
          <Text variant="labelLarge" style={styles.sectionLabel}>AmountDisplay</Text>
          <View style={styles.gap}>
            <AmountDisplay amount={1500.75} size="xl" />
            <AmountDisplay amount={-320.00} size="lg" />
            <AmountDisplay amount={0} size="md" />
            <AmountDisplay amount={42.50} size="sm" currency="USD" />
          </View>
          <Text variant="labelSmall" style={styles.mt8}>Con modo privacidad:</Text>
          <AmountDisplay amount={25000} size="lg" hidden onToggleVisibility={() => {}} />

          <Text variant="labelLarge" style={styles.sectionLabel}>AnimatedNumber</Text>
          <AnimatedNumber value={animatedNumberValue} prefix="S/ " textVariant="headlineMedium" />
          <FinancifyButton
            title="Animar (+1000)"
            variant="outline"
            size="sm"
            onPress={() => setAnimatedNumberValue(v => v + 1000)}
            style={styles.mt8}
          />
        </ExpandableCard>

        {/* ═══ LISTAS ═══ */}
        <ExpandableCard title="Listas">
          <ListItem title="Supermercado" subtitle="Hoy, 14:30" leftIcon="cart" rightValue="S/ -85.00" showChevron onPress={alertPress} />
          <ListItem title="Deposito Salario" subtitle="Ayer" leftIcon="bank" rightValue="S/ +3,500.00" rightValueColor={colors.success} />
          <ListItem title="Netflix" subtitle="01 Mar" leftIcon="television" rightValue="S/ -39.90" />

          <Text variant="labelLarge" style={styles.sectionLabel}>SwipeableRow</Text>
          <SwipeableRow
            rightActions={[
              { icon: 'pencil', label: 'Editar', color: theme.colors.primary, onPress: () => Alert.alert('Editar') },
              { icon: 'delete', label: 'Borrar', color: theme.colors.error, onPress: () => Alert.alert('Borrar') },
            ]}
          >
            <ListItem title="Desliza a la izquierda" subtitle="Swipe para acciones" leftIcon="gesture-swipe-left" rightValue="S/ -50.00" />
          </SwipeableRow>
        </ExpandableCard>

        {/* ═══ CHIPS ═══ */}
        <ExpandableCard title="Chips">
          <ChipGroup
            options={CHIP_OPTIONS}
            selected={selectedChip}
            onSelect={setSelectedChip}
          />
          <Text variant="bodySmall" style={styles.mt8}>Seleccionado: {selectedChip}</Text>
        </ExpandableCard>

        {/* ═══ DIALOGOS ═══ */}
        <ExpandableCard title="Dialogos">
          <View style={styles.gap}>
            <FinancifyButton title="AnimatedDialog" variant="outline" onPress={() => setAnimatedDialogVisible(true)} />
            <FinancifyButton title="ConfirmDialog" variant="outline" onPress={() => setConfirmDialogVisible(true)} />
            <FinancifyButton title="InputDialog" variant="outline" onPress={() => setInputDialogVisible(true)} />
            <FinancifyButton title="SelectionDialog" variant="outline" onPress={() => setSelectionDialogVisible(true)} />
          </View>

          <AnimatedDialog visible={animatedDialogVisible} onDismiss={() => setAnimatedDialogVisible(false)}>
            <Text variant="titleLarge" style={styles.dialogTitle}>Dialogo Animado</Text>
            <Text variant="bodyMedium">Ejemplo de AnimatedDialog con animacion de escala y opacidad.</Text>
          </AnimatedDialog>

          <ConfirmDialog
            visible={confirmDialogVisible}
            onDismiss={() => setConfirmDialogVisible(false)}
            title="Eliminar transaccion?"
            message="Esta accion no se puede deshacer."
            confirmLabel="Eliminar"
            cancelLabel="Cancelar"
            confirmVariant="danger"
            onConfirm={() => { setConfirmDialogVisible(false); Alert.alert('Confirmado'); }}
            icon="alert-circle"
          />

          <InputDialog
            visible={inputDialogVisible}
            onDismiss={() => setInputDialogVisible(false)}
            title="Renombrar billetera"
            message="Ingresa el nuevo nombre"
            label="Nombre"
            initialValue="Mi Billetera"
            onConfirm={(v) => { setInputDialogVisible(false); Alert.alert('Nuevo nombre', v); }}
            icon="wallet"
          />

          <SelectionDialog
            visible={selectionDialogVisible}
            onDismiss={() => setSelectionDialogVisible(false)}
            title="Seleccionar cuenta"
            options={ACCOUNT_OPTIONS}
            selectedKey="personal"
            searchable
            onSelect={(k) => { setSelectionDialogVisible(false); Alert.alert('Seleccionado', k); }}
          />
        </ExpandableCard>

        {/* ═══ NAVEGACION ═══ */}
        <ExpandableCard title="Navegacion">
          <HeaderBar title="Titulo de Pantalla" onBack={noop} />
          <HeaderBar title="Sin Back" style={styles.mt8} />
          <HeaderBar
            title="Con Accion"
            onBack={noop}
            rightAction={<FinancifyButton title="Guardar" variant="primary" size="sm" onPress={alertPress} />}
            style={styles.mt8}
          />
        </ExpandableCard>

        {/* ═══ PROGRESO ═══ */}
        <ExpandableCard title="Progreso">
          <ProgressBar progress={progressValue} label="Presupuesto usado" />
          <ProgressBar progress={0.25} label="Meta de ahorro" color={colors.success} style={styles.mt12} />
          <ProgressBar progress={0.90} label="Limite de gastos" color={colors.error} style={styles.mt12} />
          <FinancifyButton
            title="Cambiar progreso"
            variant="outline"
            size="sm"
            onPress={() => setProgressValue(Math.random())}
            style={styles.mt8}
          />
        </ExpandableCard>

        {/* ═══ BUSQUEDA ═══ */}
        <ExpandableCard title="Busqueda">
          <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Buscar transacciones..." />
          {searchText.length > 0 && (
            <Text variant="bodySmall" style={styles.mt8}>Buscando: &quot;{searchText}&quot;</Text>
          )}
        </ExpandableCard>

        {/* ═══ SKELETON ═══ */}
        <ExpandableCard title="Skeleton Loader">
          <SkeletonLoader variant="avatar" />
          <SkeletonLoader variant="title" style={styles.mt12} />
          <SkeletonLoader variant="text" count={3} style={styles.mt8} />
          <SkeletonLoader variant="card" style={styles.mt12} />
        </ExpandableCard>

        {/* ═══ DIVISORES ═══ */}
        <ExpandableCard title="Divisores">
          <DividerWithText text="O continua con" />
          <View style={styles.mt16} />
          <DividerWithText text="Seccion" textVariant="labelMedium" thickness={2} />
        </ExpandableCard>

        {/* ═══ AVATAR Y BADGE ═══ */}
        <ExpandableCard title="Avatar y Badge">
          <Text variant="labelLarge" style={styles.sectionLabel}>AvatarGroup</Text>
          <View style={styles.row}>
            <AvatarGroup name="Maria Garcia" size={48} />
            <AvatarGroup name="Juan Perez" size={48} />
            <AvatarGroup size={48} />
          </View>

          <Text variant="labelLarge" style={styles.sectionLabel}>Badge</Text>
          <View style={styles.row}>
            <Badge count={5} size="sm" />
            <Badge count={12} size="md" />
            <Badge count={150} maxCount={99} size="lg" />
            <Badge count={3}>
              <AvatarGroup name="Ana" size={40} />
            </Badge>
          </View>
        </ExpandableCard>

        {/* ═══ LOADING ═══ */}
        <ExpandableCard title="Loading">
          <Text variant="labelLarge" style={styles.sectionLabel}>LoadingOverlay (inline)</Text>
          <LoadingOverlay visible message="Cargando datos..." overlay={false} size="md" />

          <Text variant="labelLarge" style={styles.sectionLabel}>Tamanos</Text>
          <View style={styles.row}>
            <LoadingOverlay visible overlay={false} size="sm" />
            <LoadingOverlay visible overlay={false} size="md" />
            <LoadingOverlay visible overlay={false} size="lg" />
          </View>

          <Text variant="labelLarge" style={styles.sectionLabel}>Con Overlay</Text>
          <View style={styles.overlayDemo}>
            <Text variant="bodyMedium">Contenido debajo del overlay</Text>
            <LoadingOverlay visible={loadingVisible} message="Procesando..." />
          </View>
          <FinancifyButton
            title={loadingVisible ? 'Ocultar overlay' : 'Mostrar overlay'}
            variant="outline"
            size="sm"
            onPress={() => setLoadingVisible(v => !v)}
            style={styles.mt8}
          />
        </ExpandableCard>

        {/* ═══ ALERTAS ═══ */}
        <ExpandableCard title="Alertas">
          <View style={styles.gap}>
            <AlertBanner message="Informacion importante sobre tu cuenta." type="info" />
            <AlertBanner message="Transaccion registrada exitosamente." type="success" />
            <AlertBanner message="Tu presupuesto esta al 90% del limite." type="warning" />
            <AlertBanner message="Error al procesar el pago." type="error" />
          </View>

          <Text variant="labelLarge" style={styles.sectionLabel}>Con accion</Text>
          <AlertBanner
            message="Tienes 3 facturas pendientes."
            type="warning"
            action={{ label: 'Ver', onPress: alertPress }}
          />

          <Text variant="labelLarge" style={styles.sectionLabel}>Dismissible</Text>
          {!alertDismissed ? (
            <AlertBanner
              message="Esta alerta se puede cerrar."
              type="info"
              dismissible
              onDismiss={() => setAlertDismissed(true)}
            />
          ) : (
            <FinancifyButton
              title="Restaurar alerta"
              variant="outline"
              size="sm"
              onPress={() => setAlertDismissed(false)}
            />
          )}
        </ExpandableCard>

        {/* ═══ FORMIK + YUP ═══ */}
        <ExpandableCard title="Formik + Yup">
          <Formik
            initialValues={{ nombre: '', email: '', monto: '' }}
            validationSchema={FORMIK_SCHEMA}
            onSubmit={(values) => Alert.alert('Enviado', JSON.stringify(values, null, 2))}
          >
            {({ handleSubmit, isValid, dirty }) => (
              <View style={styles.gap}>
                <FormikInput name="nombre" label="Nombre completo" icon="account" />
                <FormikInput name="email" label="Email" icon="email" keyboardType="email-address" autoCapitalize="none" />
                <FormikInput name="monto" label="Monto" icon="currency-usd" keyboardType="numeric" />
                <FinancifyButton
                  title="Enviar"
                  variant="primary"
                  onPress={() => handleSubmit()}
                  disabled={!dirty || !isValid}
                  style={styles.mt8}
                />
              </View>
            )}
          </Formik>
        </ExpandableCard>

        {/* ═══ GRAFICAS ═══ */}
        <ExpandableCard title="Graficas">
          <Text variant="labelLarge" style={styles.sectionLabel}>LineChart — Ingresos mensuales</Text>
          <FinancifyLineChart data={LINE_CHART_DATA} height={180} />

          <Text variant="labelLarge" style={styles.sectionLabel}>BarChart — Gastos mensuales</Text>
          <FinancifyBarChart data={BAR_CHART_DATA} height={180} />

          <Text variant="labelLarge" style={styles.sectionLabel}>PieChart — Distribucion</Text>
          <FinancifyPieChart data={PIE_CHART_DATA} radius={90} />

          <Text variant="labelLarge" style={styles.sectionLabel}>DonutChart — Categorias</Text>
          <FinancifyPieChart
            data={PIE_CHART_DATA}
            donut
            radius={90}
            innerRadius={55}
            centerLabel="S/ 3,200"
            centerSubLabel="Total gastos"
          />
        </ExpandableCard>

        {/* ═══ TARJETAS MINIMALISTAS ═══ */}
        <ExpandableCard title="Tarjetas Minimalistas">
          <Text variant="labelLarge" style={styles.sectionLabel}>CompactCard</Text>
          <CompactCard title="Cuenta Principal" subtitle="S/ 5,300.00" icon="wallet" rightValue="Activa" />
          <CompactCard title="Tarjeta Visa" subtitle="**** 4521" icon="credit-card" rightValue="S/ -320.00" variant="blue" style={styles.mt8} />
          <CompactCard title="Ahorros" subtitle="Meta vacaciones" icon="piggy-bank" onPress={alertPress} style={styles.mt8} />

          <Text variant="labelLarge" style={styles.sectionLabel}>GradientCard</Text>
          <GradientCard preset="primary">
            <Text variant="headlineSmall" style={styles.gradientText}>S/ 15,420.75</Text>
            <Text variant="bodyMedium" style={styles.gradientSubtext}>Balance Total</Text>
          </GradientCard>
          <GradientCard preset="success" style={styles.mt8}>
            <Text variant="titleMedium" style={styles.gradientText}>Meta: Vacaciones</Text>
            <Text variant="bodySmall" style={styles.gradientSubtext}>75% completado</Text>
          </GradientCard>
          <GradientCard preset="purple" style={styles.mt8}>
            <Text variant="titleMedium" style={styles.gradientText}>Premium</Text>
            <Text variant="bodySmall" style={styles.gradientSubtext}>Desbloquea funciones avanzadas</Text>
          </GradientCard>

          <Text variant="labelLarge" style={styles.sectionLabel}>ActionCard</Text>
          <View style={styles.actionRow}>
            <ActionCard title="Transferir" icon="bank-transfer" onPress={alertPress} style={styles.flex1} />
            <ActionCard title="Pagar" icon="credit-card-outline" onPress={alertPress} style={styles.flex1} />
            <ActionCard title="Ahorrar" icon="piggy-bank" onPress={alertPress} variant="green" style={styles.flex1} />
          </View>
        </ExpandableCard>

        {/* ═══ FULL SCREEN MODAL ═══ */}
        <ExpandableCard title="Full Screen Modal">
          <FinancifyButton title="Abrir Modal Completo" variant="outline" onPress={() => setFullModalVisible(true)} />
          <FullScreenModal
            visible={fullModalVisible}
            onDismiss={() => setFullModalVisible(false)}
            title="Detalle de Transaccion"
            footer={<FinancifyButton title="Guardar Cambios" variant="primary" fullWidth onPress={() => setFullModalVisible(false)} />}
          >
            <View style={styles.gap}>
              <Text variant="titleMedium">Informacion de la transaccion</Text>
              <Text variant="bodyMedium" style={{ color: colors.neutral }}>
                Este es un ejemplo de FullScreenModal con header, contenido scrolleable y footer con boton de accion.
              </Text>
              <SimpleCard variant="blue">
                <Text variant="bodyMedium">Monto: S/ 1,250.00</Text>
                <Text variant="bodySmall">Categoria: Alimentacion</Text>
              </SimpleCard>
              <SimpleCard variant="green">
                <Text variant="bodyMedium">Estado: Completado</Text>
                <Text variant="bodySmall">Fecha: 04 Mar 2026</Text>
              </SimpleCard>
            </View>
          </FullScreenModal>
        </ExpandableCard>

        {/* ═══ SEGMENTED CONTROL ═══ */}
        <ExpandableCard title="Segmented Control">
          <SegmentedControl segments={SEGMENT_OPTIONS} selected={segmentedValue} onSelect={setSegmentedValue} />
          <Text variant="bodySmall" style={styles.mt8}>Periodo: {segmentedValue}</Text>
        </ExpandableCard>

        {/* ═══ CATEGORY ICON ═══ */}
        <ExpandableCard title="Category Icon">
          <Text variant="labelLarge" style={styles.sectionLabel}>Tamanos</Text>
          <View style={styles.row}>
            <CategoryIcon category="food" size="sm" />
            <CategoryIcon category="food" size="md" />
            <CategoryIcon category="food" size="lg" />
          </View>
          <Text variant="labelLarge" style={styles.sectionLabel}>Categorias</Text>
          <View style={[styles.row, styles.wrap]}>
            <CategoryIcon category="food" />
            <CategoryIcon category="transport" />
            <CategoryIcon category="health" />
            <CategoryIcon category="entertainment" />
            <CategoryIcon category="shopping" />
            <CategoryIcon category="housing" />
            <CategoryIcon category="salary" />
            <CategoryIcon category="investment" />
            <CategoryIcon category="bills" />
            <CategoryIcon category="savings" />
          </View>
        </ExpandableCard>

        {/* ═══ TRANSACTION CARD ═══ */}
        <ExpandableCard title="Transaction Card">
          <TransactionCard title="Supermercado Plaza" category="food" amount={85.50} type="expense" date="Hoy, 14:30" onPress={alertPress} />
          <TransactionCard title="Deposito Salario" category="salary" amount={3500} type="income" date="Ayer, 09:00" />
          <TransactionCard title="A Cuenta Ahorros" category="transfer" amount={500} type="transfer" date="01 Mar" />
          <TransactionCard title="Netflix" category="subscription" amount={39.90} type="expense" date="28 Feb" status="Recurrente" />
        </ExpandableCard>

        {/* ═══ NUMERIC KEYPAD ═══ */}
        <ExpandableCard title="Numeric Keypad">
          <View style={styles.keypadDisplay}>
            <Text variant="displaySmall" style={{ color: theme.colors.onSurface }}>
              {keypadValue.length > 0 ? `S/ ${keypadValue}` : 'S/ 0'}
            </Text>
          </View>
          <NumericKeypad value={keypadValue} onValueChange={setKeypadValue} />
        </ExpandableCard>

        {/* ═══ CHART LEGEND ═══ */}
        <ExpandableCard title="Chart Legend">
          <Text variant="labelLarge" style={styles.sectionLabel}>Vertical</Text>
          <ChartLegend items={LEGEND_ITEMS} />
          <Text variant="labelLarge" style={styles.sectionLabel}>Horizontal</Text>
          <ChartLegend items={LEGEND_ITEMS} direction="horizontal" />
        </ExpandableCard>

        {/* ═══ SECTION HEADER ═══ */}
        <ExpandableCard title="Section Header">
          <SectionHeader title="Transacciones Recientes" onAction={alertPress} />
          <SectionHeader title="Metas de Ahorro" actionLabel="Crear meta" onAction={alertPress} />
          <SectionHeader title="Solo Titulo" />
        </ExpandableCard>

        {/* ═══ FILTER BAR ═══ */}
        <ExpandableCard title="Filter Bar">
          <FilterBar
            filters={activeFilters}
            onRemove={(key) => setActiveFilters(f => f.filter(i => i.key !== key))}
            onClearAll={() => setActiveFilters([])}
          />
          {activeFilters.length === 0 && (
            <FinancifyButton
              title="Restaurar filtros"
              variant="outline"
              size="sm"
              onPress={() => setActiveFilters(INITIAL_FILTERS)}
              style={styles.mt8}
            />
          )}
        </ExpandableCard>

        {/* ═══ STEP INDICATOR ═══ */}
        <ExpandableCard title="Step Indicator">
          <Text variant="labelLarge" style={styles.sectionLabel}>Dots</Text>
          <StepIndicator total={5} current={currentStep} variant="dots" showLabel />
          <Text variant="labelLarge" style={styles.sectionLabel}>Bar</Text>
          <StepIndicator total={5} current={currentStep} variant="bar" showLabel />
          <View style={[styles.row, styles.mt8]}>
            <FinancifyButton title="Anterior" variant="outline" size="sm" onPress={() => setCurrentStep(s => Math.max(1, s - 1))} />
            <FinancifyButton title="Siguiente" variant="outline" size="sm" onPress={() => setCurrentStep(s => Math.min(5, s + 1))} />
          </View>
        </ExpandableCard>

        {/* ═══ OTP INPUT ═══ */}
        <ExpandableCard title="OTP Input">
          <Text variant="labelLarge" style={styles.sectionLabel}>Verificacion 2FA</Text>
          <OTPInput
            value={otpValue}
            onValueChange={(v) => { setOtpValue(v); setOtpError(false); }}
            onComplete={(code) => Alert.alert('OTP Completo', code)}
            error={otpError}
            errorMessage="Codigo incorrecto"
          />
          <View style={[styles.row, styles.mt12, { justifyContent: 'center' }]}>
            <FinancifyButton title="Simular error" variant="outline" size="sm" onPress={() => setOtpError(true)} />
            <FinancifyButton title="Limpiar" variant="ghost" size="sm" onPress={() => { setOtpValue(''); setOtpError(false); }} />
          </View>
          <Text variant="labelLarge" style={styles.sectionLabel}>Con mascara</Text>
          <OTPInput value="" onValueChange={noop} length={4} secureEntry />
        </ExpandableCard>

        {/* ═══ PIN KEYPAD ═══ */}
        <ExpandableCard title="PIN Keypad">
          <PINKeypad
            value={pinValue}
            onValueChange={(v) => { setPinValue(v); setPinError(false); }}
            onComplete={(pin) => Alert.alert('PIN ingresado', pin)}
            error={pinError}
            errorMessage="PIN incorrecto"
            biometricType="fingerprint"
            onBiometric={() => Alert.alert('Biometrico', 'Huella dactilar activada')}
          />
          <View style={[styles.row, styles.mt12, { justifyContent: 'center' }]}>
            <FinancifyButton title="Simular error" variant="outline" size="sm" onPress={() => setPinError(true)} />
            <FinancifyButton title="Limpiar" variant="ghost" size="sm" onPress={() => { setPinValue(''); setPinError(false); }} />
          </View>
        </ExpandableCard>

        {/* ═══ TOOLTIP ═══ */}
        <ExpandableCard title="InfoTip / Tooltip">
          <View style={styles.gap}>
            <View style={styles.row}>
              <Text variant="bodyMedium">Tasa Efectiva Anual (TEA)</Text>
              <InfoTip text="La TEA es la tasa de interes que se aplica a un deposito o prestamo durante un periodo de un ano, incluyendo la capitalizacion de intereses." />
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium">Comision de mantenimiento</Text>
              <InfoTip text="Cargo mensual por mantener tu cuenta activa. Puede ser exonerada cumpliendo ciertas condiciones." icon="help-circle-outline" />
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium">CCI</Text>
              <InfoTip text="Codigo de Cuenta Interbancario. Numero de 20 digitos para transferencias entre bancos." />
            </View>
          </View>
        </ExpandableCard>

        {/* ═══ COPY BUTTON ═══ */}
        <ExpandableCard title="CopyButton">
          <View style={styles.gap}>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.flex1}>N° Cuenta: 1234-5678-9012</Text>
              <CopyButton text="123456789012" />
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.flex1}>CCI: 00212345678901234567</Text>
              <CopyButton text="00212345678901234567" showLabel />
            </View>
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.flex1}>Ref: TXN-2026-0304</Text>
              <CopyButton text="TXN-2026-0304" showLabel label="Copiar ref" />
            </View>
          </View>
        </ExpandableCard>

        {/* ═══ COUNTDOWN TIMER ═══ */}
        <ExpandableCard title="Countdown Timer">
          <Text variant="labelLarge" style={styles.sectionLabel}>OTP Expiry</Text>
          <CountdownTimer
            key={countdownKey}
            seconds={30}
            onExpire={() => Alert.alert('Expirado')}
            onResend={() => { setCountdownKey(k => k + 1); }}
          />
          <Text variant="labelLarge" style={styles.sectionLabel}>Tamanos</Text>
          <View style={styles.row}>
            <CountdownTimer seconds={90} size="sm" running={false} />
            <CountdownTimer seconds={90} size="md" running={false} />
            <CountdownTimer seconds={90} size="lg" running={false} />
          </View>
          <Text variant="labelLarge" style={styles.sectionLabel}>Warning ({'<'} 10s)</Text>
          <CountdownTimer seconds={8} running={false} />
        </ExpandableCard>

        {/* ═══ CAROUSEL ═══ */}
        <ExpandableCard title="Carousel">
          <Carousel
            data={[
              <GradientCard preset="primary">
                <Text variant="titleMedium" style={styles.gradientText}>Cuenta Principal</Text>
                <Text variant="headlineSmall" style={styles.gradientText}>S/ 15,420.75</Text>
                <Text variant="bodySmall" style={styles.gradientSubtext}>**** 4521</Text>
              </GradientCard>,
              <GradientCard preset="success">
                <Text variant="titleMedium" style={styles.gradientText}>Ahorros</Text>
                <Text variant="headlineSmall" style={styles.gradientText}>S/ 8,200.00</Text>
                <Text variant="bodySmall" style={styles.gradientSubtext}>Meta: Vacaciones</Text>
              </GradientCard>,
              <GradientCard preset="purple">
                <Text variant="titleMedium" style={styles.gradientText}>Inversion</Text>
                <Text variant="headlineSmall" style={styles.gradientText}>S/ 25,000.00</Text>
                <Text variant="bodySmall" style={styles.gradientSubtext}>Renta fija 6.5%</Text>
              </GradientCard>,
            ]}
          />
        </ExpandableCard>

        {/* ═══ NOTIFICATION BELL ═══ */}
        <ExpandableCard title="Notification Bell">
          <View style={styles.row}>
            <NotificationBell count={0} onPress={alertPress} />
            <NotificationBell count={3} onPress={alertPress} />
            <NotificationBell count={12} onPress={alertPress} />
            <NotificationBell count={150} onPress={alertPress} />
          </View>
        </ExpandableCard>

        {/* ═══ ERROR BOUNDARY ═══ */}
        <ExpandableCard title="Error Boundary">
          <Text variant="bodySmall" style={styles.mb8}>
            Envuelve componentes para capturar errores y mostrar un fallback en lugar de crashear la app.
          </Text>
          <ErrorBoundary>
            <SimpleCard>
              <Text variant="bodyMedium">Este contenido esta protegido por ErrorBoundary</Text>
            </SimpleCard>
          </ErrorBoundary>
          <Text variant="labelLarge" style={styles.sectionLabel}>Custom fallback</Text>
          <ErrorBoundary
            fallback={
              <AlertBanner message="Se produjo un error. Intenta recargar." type="error" />
            }
          >
            <SimpleCard variant="blue">
              <Text variant="bodyMedium">Componente con fallback personalizado</Text>
            </SimpleCard>
          </ErrorBoundary>
        </ExpandableCard>

        {/* ═══ PULL TO REFRESH ═══ */}
        <ExpandableCard title="Pull to Refresh">
          <Text variant="bodySmall" style={styles.mb8}>
            Wrapper con RefreshControl integrado y colores del tema.
          </Text>
          <View style={styles.pullToRefreshDemo}>
            <PullToRefresh refreshing={refreshing} onRefresh={handleRefresh}>
              <View style={styles.gap}>
                <ListItem title="Desliza hacia abajo" subtitle="Para simular refresh" leftIcon="arrow-down" />
                <ListItem title="Cargando datos..." subtitle={refreshing ? 'Actualizando...' : 'Datos actualizados'} leftIcon="database" />
                <ListItem title="Ultima actualizacion" subtitle="Hace un momento" leftIcon="clock-outline" />
              </View>
            </PullToRefresh>
          </View>
          <FinancifyButton
            title={refreshing ? 'Refrescando...' : 'Simular refresh'}
            variant="outline"
            size="sm"
            loading={refreshing}
            onPress={handleRefresh}
            style={styles.mt8}
          />
        </ExpandableCard>

        {/* ═══ KEYBOARD AVOIDING ═══ */}
        <ExpandableCard title="Keyboard Avoiding Wrapper">
          <Text variant="bodySmall" style={styles.mb8}>
            Wrapper que ajusta el contenido cuando el teclado aparece. iOS: padding, Android: height.
          </Text>
          <SimpleCard>
            <View style={styles.gap}>
              <Text variant="bodyMedium">Uso tipico:</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {'<KeyboardAvoidingWrapper>\n  <FormInput ... />\n  <FormInput ... />\n  <FinancifyButton ... />\n</KeyboardAvoidingWrapper>'}
              </Text>
            </View>
          </SimpleCard>
          <View style={styles.mt8}>
            <FormInput label="Prueba el teclado" value="" onChangeText={noop} icon="keyboard" />
          </View>
        </ExpandableCard>

        {/* ═══ SNACKBAR ═══ */}
        <ExpandableCard title="Snackbar (useSnackbar)">
          <View style={styles.gap}>
            <FinancifyButton title="Default" variant="outline" size="sm" onPress={() => showSnackbar('Mensaje por defecto')} />
            <FinancifyButton title="Success" variant="success" size="sm" onPress={() => showSnackbar('Transaccion registrada', { type: 'success' })} />
            <FinancifyButton title="Error" variant="danger" size="sm" onPress={() => showSnackbar('Error al procesar pago', { type: 'error' })} />
            <FinancifyButton title="Warning" variant="warning" size="sm" onPress={() => showSnackbar('Presupuesto al 90%', { type: 'warning' })} />
            <FinancifyButton title="Info + Action" variant="outline" size="sm" onPress={() => showSnackbar('3 facturas pendientes', { type: 'info', actionLabel: 'Ver', onAction: alertPress })} />
            <FinancifyButton title="Test Cola (3 msgs)" variant="outline" size="sm" onPress={() => {
              showSnackbar('Mensaje 1 de 3', { type: 'info' });
              showSnackbar('Mensaje 2 de 3', { type: 'success' });
              showSnackbar('Mensaje 3 de 3', { type: 'warning' });
            }} />
          </View>
        </ExpandableCard>

        {/* ═══ SMOOTH POPUP ═══ */}
        <ExpandableCard title="SmoothPopupFullScreen">
          <FinancifyButton title="Abrir Smooth Popup" variant="outline" onPress={() => setSmoothPopupVisible(true)} />
          <SmoothPopupFullScreen
            visible={smoothPopupVisible}
            onDismiss={() => setSmoothPopupVisible(false)}
            title="Detalle"
          >
            <View style={styles.gap}>
              <Text variant="titleMedium">Popup con animacion scale</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Animacion de entrada tipo popup elegante (scale + opacity spring).
              </Text>
              <SimpleCard variant="blue">
                <Text variant="bodyMedium">Contenido dentro del popup</Text>
              </SimpleCard>
            </View>
          </SmoothPopupFullScreen>
        </ExpandableCard>

        {/* ═══ PARTICLES BACKGROUND ═══ */}
        <ExpandableCard title="Particles Background">
          <View style={styles.particlesDemo}>
            <OptimizedParticlesBackground particleCount={4} enabled>
              <View style={styles.particlesContent}>
                <Text variant="titleMedium" style={{ textAlign: 'center' }}>Fondo animado</Text>
                <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  Particulas flotantes decorativas
                </Text>
              </View>
            </OptimizedParticlesBackground>
          </View>
        </ExpandableCard>

        {/* ═══ MASKED INPUT ═══ */}
        <ExpandableCard title="Masked Input">
          <Text variant="labelLarge" style={styles.sectionLabel}>Tarjeta de credito</Text>
          <MaskedInput
            label="Numero de tarjeta"
            value={cardNumber}
            onChangeText={(raw) => setCardNumber(raw)}
            preset="card"
            icon="credit-card"
          />
          <Text variant="labelLarge" style={styles.sectionLabel}>Tarjeta oculta</Text>
          <MaskedInput
            label="Tarjeta (oculta)"
            value="4521876543210987"
            onChangeText={noop}
            preset="card"
            hideValue
            visibleDigits={4}
            icon="credit-card-lock"
            editable={false}
          />
          <Text variant="labelLarge" style={styles.sectionLabel}>Cuenta bancaria</Text>
          <MaskedInput
            label="N° de cuenta"
            value=""
            onChangeText={noop}
            preset="account"
            icon="bank"
          />
        </ExpandableCard>

        {/* ═══ PHONE NUMBER INPUT ═══ */}
        <ExpandableCard title="Phone Number Input">
          <PhoneNumberInput
            value={phoneValue}
            onChangeText={(phone) => setPhoneValue(phone)}
            countryCode={phoneCountry}
            onCountryChange={(c) => setPhoneCountry(c.code)}
          />
          {phoneValue.length > 0 && (
            <Text variant="bodySmall" style={styles.mt8}>Digitos: {phoneValue}</Text>
          )}
        </ExpandableCard>

        {/* ═══ SWIPE TO CONFIRM ═══ */}
        <ExpandableCard title="Swipe to Confirm">
          <SwipeToConfirm
            onConfirm={() => Alert.alert('Confirmado', 'Pago procesado exitosamente')}
            label="Desliza para pagar S/ 250.00"
          />
          <SwipeToConfirm
            onConfirm={noop}
            label="Deshabilitado"
            disabled
            style={styles.mt12}
          />
        </ExpandableCard>

        {/* ═══ CONNECTION STATUS ═══ */}
        <ExpandableCard title="Connection Status">
          <View style={styles.gap}>
            <View style={styles.row}>
              <ConnectionStatus status="online" />
              <ConnectionStatus status="offline" />
              <ConnectionStatus status="syncing" />
            </View>
            <Text variant="labelLarge" style={styles.sectionLabel}>Compacto</Text>
            <View style={styles.row}>
              <ConnectionStatus status="online" compact />
              <ConnectionStatus status="offline" compact />
              <ConnectionStatus status="syncing" compact />
            </View>
          </View>
        </ExpandableCard>

        {/* ═══ PERCENTAGE BADGE ═══ */}
        <ExpandableCard title="Percentage Badge">
          <View style={styles.gap}>
            <View style={styles.row}>
              <PercentageBadge value={12.5} />
              <PercentageBadge value={-3.2} />
              <PercentageBadge value={0} />
            </View>
            <Text variant="labelLarge" style={styles.sectionLabel}>Tamanos</Text>
            <View style={styles.row}>
              <PercentageBadge value={8.3} size="sm" />
              <PercentageBadge value={8.3} size="md" />
              <PercentageBadge value={8.3} size="lg" />
            </View>
          </View>
        </ExpandableCard>

        {/* ═══ CIRCULAR PROGRESS RING ═══ */}
        <ExpandableCard title="Circular Progress Ring">
          <View style={styles.row}>
            <CircularProgressRing progress={0.75} size="sm" label="Basico" />
            <CircularProgressRing progress={0.45} size="md" label="Ahorro" />
            <CircularProgressRing progress={0.92} size="lg" label="Presupuesto" color={colors.warning} />
          </View>
          <Text variant="labelLarge" style={styles.sectionLabel}>XL con contenido custom</Text>
          <View style={{ alignItems: 'center' }}>
            <CircularProgressRing
              progress={0.68}
              size="xl"
              centerContent={
                <View style={{ alignItems: 'center' }}>
                  <Text variant="titleLarge" style={{ fontWeight: '700' }}>S/ 6,800</Text>
                  <Text variant="labelSmall" style={{ color: colors.neutral }}>de S/ 10,000</Text>
                </View>
              }
              label="Meta vacaciones"
            />
          </View>
        </ExpandableCard>

        {/* ═══ CHECKBOX ═══ */}
        <ExpandableCard title="Checkbox">
          <View style={styles.gap}>
            <Checkbox
              checked={checkTerms}
              onToggle={setCheckTerms}
              label="Acepto los terminos y condiciones"
              description="Al marcar, aceptas nuestra politica de privacidad"
            />
            <Checkbox
              checked={checkNotif}
              onToggle={setCheckNotif}
              label="Recibir notificaciones"
            />
            <Checkbox
              checked={checkPromo}
              onToggle={setCheckPromo}
              label="Ofertas y promociones"
              description="Te enviaremos ofertas personalizadas"
            />
          </View>
          <Text variant="labelLarge" style={styles.sectionLabel}>Estados</Text>
          <View style={styles.gap}>
            <Checkbox checked={false} onToggle={noop} label="Disabled" disabled />
            <Checkbox checked={true} onToggle={noop} label="Disabled checked" disabled />
            <Checkbox checked={false} onToggle={noop} label="Con error" error />
            <Checkbox checked={false} onToggle={noop} label="Indeterminate" indeterminate />
          </View>
          <Text variant="labelLarge" style={styles.sectionLabel}>Tamanos</Text>
          <View style={styles.gap}>
            <Checkbox checked={true} onToggle={noop} label="Small" size="sm" />
            <Checkbox checked={true} onToggle={noop} label="Medium" size="md" />
            <Checkbox checked={true} onToggle={noop} label="Large" size="lg" />
          </View>
        </ExpandableCard>

        {/* ═══ LOADING STATES ═══ */}
        <ExpandableCard title="Loading States">
          <Text variant="labelLarge" style={styles.sectionLabel}>ListItem loading</Text>
          <ListItem title="" leftIcon="cart" subtitle="" rightValue="" loading />
          <ListItem title="" subtitle="" loading style={styles.mt8} />
          <Text variant="labelLarge" style={styles.sectionLabel}>TransactionCard loading</Text>
          <TransactionCard title="" category="" amount={0} loading />
          <TransactionCard title="" category="" amount={0} loading style={styles.mt8} />
        </ExpandableCard>

        {/* ═══ BOTTOM SHEET ═══ */}
        <ExpandableCard title="Bottom Sheet">
          <FinancifyButton title="Abrir Bottom Sheet" variant="outline" onPress={() => setBottomSheetVisible(true)} />
        </ExpandableCard>

      </ScrollView>

      <FinancifyBottomSheet
        visible={bottomSheetVisible}
        onDismiss={() => setBottomSheetVisible(false)}
        title="Acciones rapidas"
      >
        <View style={styles.gap}>
          <ListItem title="Editar transaccion" leftIcon="pencil" onPress={() => { setBottomSheetVisible(false); alertPress(); }} showChevron />
          <ListItem title="Compartir recibo" leftIcon="share-variant" onPress={() => { setBottomSheetVisible(false); alertPress(); }} showChevron />
          <ListItem title="Duplicar" leftIcon="content-copy" onPress={() => { setBottomSheetVisible(false); alertPress(); }} showChevron />
          <ListItem title="Eliminar" leftIcon="delete-outline" rightValueColor={colors.loss} onPress={() => { setBottomSheetVisible(false); alertPress(); }} showChevron />
        </View>
      </FinancifyBottomSheet>
      </SafeAreaView>
    </ThemeContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  gap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  mt8: {
    marginTop: 8,
  },
  mt12: {
    marginTop: 12,
  },
  mt16: {
    marginTop: 16,
  },
  mv12: {
    marginVertical: 12,
  },
  fabContainer: {
    height: 80,
    position: 'relative',
  },
  feedbackContainer: {
    flex: 0,
    minHeight: 200,
  },
  dialogTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overlayDemo: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E7EF',
    position: 'relative',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  gradientText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gradientSubtext: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  keypadDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  mb8: {
    marginBottom: 8,
  },
  pullToRefreshDemo: {
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E7EF',
    overflow: 'hidden',
  },
  particlesDemo: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  particlesContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
