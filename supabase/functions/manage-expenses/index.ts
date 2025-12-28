import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY')
const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID')
const AIRTABLE_TABLE_NAME = 'Despesas'

interface ExpenseInput {
  date: string
  category: string
  amount: number
  description: string
}

interface AirtableRecord {
  id: string
  fields: {
    Data: string
    Categoria: string
    Valor: number
    Descricao: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'

    console.log(`[manage-expenses] Action: ${action}`)

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('[manage-expenses] Missing Airtable credentials')
      throw new Error('Airtable credentials not configured')
    }

    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`

    if (req.method === 'POST' && action === 'create') {
      // Create new expense
      const body: ExpenseInput = await req.json()
      console.log('[manage-expenses] Creating expense:', body)

      const airtableResponse = await fetch(airtableUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{
            fields: {
              Data: body.date,
              Categoria: body.category,
              Valor: body.amount,
              Descricao: body.description,
            }
          }]
        }),
      })

      if (!airtableResponse.ok) {
        const errorText = await airtableResponse.text()
        console.error('[manage-expenses] Airtable error:', errorText)
        throw new Error('Failed to create expense in Airtable')
      }

      const result = await airtableResponse.json()
      console.log('[manage-expenses] Expense created successfully')

      return new Response(
        JSON.stringify({ success: true, record: result.records[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET' && action === 'list') {
      // List all expenses
      console.log('[manage-expenses] Fetching expenses')

      const airtableResponse = await fetch(`${airtableUrl}?sort%5B0%5D%5Bfield%5D=Data&sort%5B0%5D%5Bdirection%5D=desc`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      })

      if (!airtableResponse.ok) {
        const errorText = await airtableResponse.text()
        console.error('[manage-expenses] Airtable error:', errorText)
        throw new Error('Failed to fetch expenses from Airtable')
      }

      const result = await airtableResponse.json()
      const expenses = result.records.map((record: AirtableRecord) => ({
        id: record.id,
        date: record.fields.Data,
        category: record.fields.Categoria,
        amount: record.fields.Valor,
        description: record.fields.Descricao,
      }))

      console.log(`[manage-expenses] Found ${expenses.length} expenses`)

      return new Response(
        JSON.stringify({ success: true, expenses }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET' && action === 'summary') {
      // Get financial summary (expenses + revenue from reservations)
      console.log('[manage-expenses] Fetching financial summary')

      // Fetch expenses
      const expensesResponse = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      })

      if (!expensesResponse.ok) {
        throw new Error('Failed to fetch expenses')
      }

      const expensesResult = await expensesResponse.json()
      const totalExpenses = expensesResult.records.reduce((sum: number, record: AirtableRecord) => {
        return sum + (record.fields.Valor || 0)
      }, 0)

      // Fetch revenue from Reservas table
      const reservasUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Reservas')}`
      const reservasResponse = await fetch(reservasUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      })

      let totalRevenue = 0
      let reservationCount = 0
      let coffeeCost = 0

      if (reservasResponse.ok) {
        const reservasResult = await reservasResponse.json()
        reservationCount = reservasResult.records.length
        
        totalRevenue = reservasResult.records.reduce((sum: number, record: any) => {
          return sum + (record.fields.Valor || record.fields.valor || 0)
        }, 0)

        // Calculate coffee cost (assume 2 courtesy coffees per reservation @ R$3/capsule)
        coffeeCost = reservationCount * 2 * 3
      }

      const netProfit = totalRevenue - totalExpenses - coffeeCost

      // Group expenses by category
      const expensesByCategory: Record<string, number> = {}
      expensesResult.records.forEach((record: AirtableRecord) => {
        const category = record.fields.Categoria || 'Outros'
        expensesByCategory[category] = (expensesByCategory[category] || 0) + (record.fields.Valor || 0)
      })

      console.log(`[manage-expenses] Summary - Revenue: ${totalRevenue}, Expenses: ${totalExpenses}, Coffee: ${coffeeCost}, Net: ${netProfit}`)

      return new Response(
        JSON.stringify({
          success: true,
          summary: {
            totalRevenue,
            totalExpenses,
            coffeeCost,
            netProfit,
            reservationCount,
            expensesByCategory,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[manage-expenses] Error:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
