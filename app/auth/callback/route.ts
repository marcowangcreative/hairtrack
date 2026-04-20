import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('missing auth code')}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const user = (await supabase.auth.getUser()).data.user;
  if (user) {
    const name =
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split('@')[0] ??
      'User';
    await supabase
      .from('ht_profiles')
      .upsert(
        { id: user.id, name },
        { onConflict: 'id', ignoreDuplicates: true }
      );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
